import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Code, User } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  type ConfirmationResult,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

type LoginAudience = 'personal' | 'developer';
type LoginMethod = 'password' | 'sms';
type AuthMode = 'login' | 'register';

function normalizePhoneNumber(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('+')) return trimmed.replace(/\s/g, '');
  const digits = trimmed.replace(/\D/g, '');
  return digits.length === 11 ? `+86${digits}` : trimmed;
}

function getAuthErrorMessage(error: unknown, isEnglish: boolean) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  const zh: Record<string, string> = {
    'auth/email-already-in-use': '这个邮箱已经注册，请直接登录。',
    'auth/invalid-email': '邮箱格式不正确。',
    'auth/invalid-phone-number': '手机号格式不正确。中国大陆手机号可直接输入 11 位数字。',
    'auth/invalid-verification-code': '验证码不正确，请重新输入。',
    'auth/missing-verification-code': '请输入短信验证码。',
    'auth/too-many-requests': '请求过于频繁，请稍后再试。',
    'auth/user-not-found': '账号不存在，请先注册。',
    'auth/wrong-password': '密码不正确。',
    'auth/invalid-credential': '账号或密码不正确。',
    'auth/weak-password': '密码至少需要 6 位。',
    'auth/operation-not-allowed': 'Firebase 控制台尚未启用此登录方式。',
    'auth/captcha-check-failed': '人机验证失败，请刷新页面后再试。',
  };
  const en: Record<string, string> = {
    'auth/email-already-in-use': 'This email has already been registered.',
    'auth/invalid-email': 'The email address is invalid.',
    'auth/invalid-phone-number': 'The phone number is invalid.',
    'auth/invalid-verification-code': 'The verification code is incorrect.',
    'auth/missing-verification-code': 'Please enter the SMS code.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/user-not-found': 'Account not found. Please register first.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect account or password.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/operation-not-allowed': 'This sign-in provider is not enabled in Firebase.',
    'auth/captcha-check-failed': 'reCAPTCHA failed. Please refresh and try again.',
  };
  return (isEnglish ? en[code] : zh[code]) || (isEnglish ? 'Authentication failed. Please try again.' : '登录失败，请稍后再试。');
}

export function Login() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<LoginAudience>('personal');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [message, setMessage] = useState('');
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    return () => {
      verifierRef.current?.clear();
      verifierRef.current = null;
    };
  }, []);

  const getRedirectPath = () => {
    const next = searchParams.get('next');
    if (next?.startsWith('/') && !next.startsWith('//')) return next;
    return activeTab === 'developer' ? '/admin' : '/';
  };

  const ensureRecaptcha = () => {
    auth.languageCode = isEnglish ? 'en' : 'zh-CN';
    verifierRef.current ||= new RecaptchaVerifier(auth, 'login-recaptcha-container', {
      size: 'invisible',
    });
    return verifierRef.current;
  };

  const sendSmsCode = async () => {
    if (!termsAccepted) {
      setMessage(isEnglish ? 'Please agree to the copyright and privacy notice first.' : '请先勾选同意版权声明及隐私声明。');
      return;
    }
    if (!phone.trim()) {
      setMessage(isEnglish ? 'Please enter your phone number.' : '请输入手机号。');
      return;
    }

    setIsSendingCode(true);
    setMessage('');
    try {
      const confirmation = await signInWithPhoneNumber(auth, normalizePhoneNumber(phone), ensureRecaptcha());
      confirmationRef.current = confirmation;
      setMessage(isEnglish ? 'SMS code sent. Please check your phone.' : '验证码已发送，请查看手机短信。');
    } catch (error) {
      verifierRef.current?.clear();
      verifierRef.current = null;
      setMessage(getAuthErrorMessage(error, isEnglish));
    } finally {
      setIsSendingCode(false);
    }
  };

  const handlePasswordAuth = async () => {
    if (!email.trim() || !password) {
      setMessage(isEnglish ? 'Please enter email and password.' : '请输入邮箱和密码。');
      return;
    }
    if (authMode === 'register') {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName.trim()) await updateProfile(result.user, { displayName: displayName.trim() });
    } else {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    }
    navigate(getRedirectPath(), { replace: true });
  };

  const handleSmsAuth = async () => {
    if (!confirmationRef.current) {
      setMessage(isEnglish ? 'Please get the SMS code first.' : '请先获取验证码。');
      return;
    }
    if (!smsCode.trim()) {
      setMessage(isEnglish ? 'Please enter the SMS code.' : '请输入短信验证码。');
      return;
    }
    await confirmationRef.current.confirm(smsCode.trim());
    navigate(getRedirectPath(), { replace: true });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!termsAccepted) {
      setMessage(isEnglish ? 'Please agree to the copyright and privacy notice first.' : '请先勾选同意版权声明及隐私声明。');
      return;
    }
    setIsSubmitting(true);
    setMessage('');
    try {
      if (loginMethod === 'password') await handlePasswordAuth();
      else await handleSmsAuth();
    } catch (error) {
      setMessage(getAuthErrorMessage(error, isEnglish));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPassword = async () => {
    if (!email.trim()) {
      setMessage(isEnglish ? 'Enter your email first, then click forgot password.' : '请先输入邮箱，再点击忘记密码。');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage(isEnglish ? 'Password reset email sent.' : '密码重置邮件已发送。');
    } catch (error) {
      setMessage(getAuthErrorMessage(error, isEnglish));
    }
  };

  return (
    <div className="login-page relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08090a] px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "url('/login-pattern-bg.jpg')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          transform: 'scale(1.08)',
          filter: 'blur(12px) brightness(0.64) contrast(1.28) saturate(1.08)',
        }}
      />

      <button onClick={() => navigate(-1)} className="absolute left-8 top-8 z-10 flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        {isEnglish ? 'Back' : '返回'}
      </button>

      <div className="login-card relative z-10 w-full max-w-[400px] rounded-xl bg-[#121316]/88 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-7 text-center">
          <h1 className="mb-3 text-4xl font-bold tracking-[0.2em] text-fuchsia-700" style={{ fontFamily: 'serif' }}>
            {isEnglish ? 'XIUYIJING' : '绣艺境'}
          </h1>
          <p className="font-serif text-xs uppercase tracking-[0.4em] text-fuchsia-700/60">
            {isEnglish ? 'Han Embroidery Archive' : '非遗汉绣'}
          </p>
        </div>

        <div className="mb-7 flex rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={
              'flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-xs font-medium transition-all ' +
              (activeTab === 'personal' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80')
            }
          >
            <User className="h-3.5 w-3.5" />
            {isEnglish ? 'Personal' : '个人'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('developer')}
            className={
              'flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-xs font-medium transition-all ' +
              (activeTab === 'developer' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80')
            }
          >
            <Code className="h-3.5 w-3.5" />
            {isEnglish ? 'Admin' : '管理'}
          </button>
        </div>

        <div className="mb-7 flex justify-center gap-8 border-b border-white/10">
          <button
            type="button"
            onClick={() => setLoginMethod('password')}
            className={
              'relative pb-3 text-sm font-medium tracking-widest transition-colors ' +
              (loginMethod === 'password' ? 'text-fuchsia-500' : 'text-white/50 hover:text-white/80')
            }
          >
            {isEnglish ? 'Password' : '密码登录'}
            {loginMethod === 'password' && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-fuchsia-500" />}
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('sms')}
            className={
              'relative pb-3 text-sm font-medium tracking-widest transition-colors ' +
              (loginMethod === 'sms' ? 'text-fuchsia-500' : 'text-white/50 hover:text-white/80')
            }
          >
            {isEnglish ? 'SMS' : '短信登录'}
            {loginMethod === 'sms' && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-fuchsia-500" />}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            {loginMethod === 'password' ? (
              <>
                {authMode === 'register' && (
                  <input
                    type="text"
                    placeholder={isEnglish ? 'Display name' : '昵称'}
                    className="w-full rounded-md border border-white/10 bg-transparent px-4 py-3 text-sm text-white transition-all placeholder:text-white/30 focus:border-fuchsia-600/50 focus:outline-none"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                )}
                <input
                  type="email"
                  placeholder={isEnglish ? 'Email' : '邮箱'}
                  className="w-full rounded-md border border-white/10 bg-transparent px-4 py-3 text-sm text-white transition-all placeholder:text-white/30 focus:border-fuchsia-600/50 focus:outline-none"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder={isEnglish ? 'Password' : authMode === 'register' ? '设置密码（至少 6 位）' : '请输入密码'}
                  className="w-full rounded-md border border-white/10 bg-transparent px-4 py-3 text-sm text-white transition-all placeholder:text-white/30 focus:border-fuchsia-600/50 focus:outline-none"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </>
            ) : (
              <>
                <input
                  type="tel"
                  placeholder={isEnglish ? 'Phone, e.g. +8613800000000' : '手机号（中国大陆可直接输入 11 位）'}
                  className="w-full rounded-md border border-white/10 bg-transparent px-4 py-3 text-sm text-white transition-all placeholder:text-white/30 focus:border-fuchsia-600/50 focus:outline-none"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                />
                <div className="grid grid-cols-[minmax(0,1fr)_104px] gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={isEnglish ? 'Code' : '请输入验证码'}
                    className="min-w-0 rounded-md border border-white/10 bg-transparent px-4 py-3 text-sm text-white transition-all placeholder:text-white/30 focus:border-fuchsia-600/50 focus:outline-none"
                    value={smsCode}
                    onChange={(event) => setSmsCode(event.target.value)}
                    required
                  />
                  <button
                    id="sms-code-button"
                    type="button"
                    disabled={isSendingCode}
                    onClick={() => void sendSmsCode()}
                    className="rounded-md bg-white/5 px-2 py-3 text-sm text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSendingCode ? (isEnglish ? 'Sending' : '发送中') : (isEnglish ? 'Get Code' : '获取验证码')}
                  </button>
                </div>
                <p className="text-xs leading-5 text-white/35">
                  {isEnglish ? 'A new phone number will be registered automatically after verification.' : '手机号首次验证成功后会自动完成注册。'}
                </p>
              </>
            )}
          </div>

          <div id="login-recaptcha-container" className="min-h-0" />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-white/20 bg-transparent text-fuchsia-600 accent-fuchsia-600 focus:ring-fuchsia-500"
            />
            <label htmlFor="terms" className="cursor-pointer text-xs text-white/50">
              {isEnglish ? 'I agree to ' : '阅读并同意 '}
              <span className="text-fuchsia-500 hover:text-fuchsia-400">{isEnglish ? 'Copyright & Privacy Notice' : '《版权声明及隐私声明》'}</span>
            </label>
          </div>

          {message && <p className="rounded border border-fuchsia-500/20 bg-fuchsia-950/20 px-3 py-2 text-xs leading-5 text-fuchsia-100/85">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 py-3.5 text-sm font-medium tracking-widest text-white shadow-[0_0_26px_rgba(217,70,239,0.24)] transition-colors hover:from-purple-600 hover:via-fuchsia-500 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (isEnglish ? 'Processing...' : '处理中...') : authMode === 'register' && loginMethod === 'password' ? (isEnglish ? 'Register' : '注册') : (isEnglish ? 'Login' : '登录')}
          </button>

          <div className="mt-6 flex items-center justify-between text-xs tracking-wider">
            <span className="text-white/40">
              {authMode === 'login' ? (isEnglish ? 'No account? ' : '没有账号？') : (isEnglish ? 'Have an account? ' : '已有账号？')}
              <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-fuchsia-500 transition-colors hover:text-fuchsia-400">
                {authMode === 'login' ? (isEnglish ? 'Register' : '立即注册') : (isEnglish ? 'Login' : '去登录')}
              </button>
            </span>
            {loginMethod === 'password' && (
              <button type="button" onClick={() => void resetPassword()} className="text-white/40 transition-colors hover:text-white">
                {isEnglish ? 'Forgot password' : '忘记密码'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
