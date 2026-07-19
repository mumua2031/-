import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Code, User } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { syncUserProfile } from '../lib/userAccount';

type LoginAudience = 'personal' | 'developer';
type AuthMode = 'login' | 'register';

function getAuthErrorMessage(error: unknown, isEnglish: boolean) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code) : '';
  const zh: Record<string, string> = {
    'auth/email-already-in-use': '这个邮箱已经注册，请直接登录。',
    'auth/invalid-email': '邮箱格式不正确。',
    'auth/too-many-requests': '请求过于频繁，请稍后再试。',
    'auth/user-not-found': '账号不存在，请先注册。',
    'auth/wrong-password': '密码不正确。',
    'auth/invalid-credential': '账号或密码不正确。',
    'auth/weak-password': '密码至少需要 6 位。',
    'auth/missing-password': '请输入密码。',
    'auth/operation-not-allowed': 'Firebase 控制台尚未启用邮箱密码登录。',
  };
  const en: Record<string, string> = {
    'auth/email-already-in-use': 'This email has already been registered.',
    'auth/invalid-email': 'The email address is invalid.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/user-not-found': 'Account not found. Please register first.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect account or password.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/missing-password': 'Please enter your password.',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled in Firebase.',
  };
  return (isEnglish ? en[code] : zh[code]) || (isEnglish ? 'Authentication failed. Please try again.' : '登录失败，请稍后再试。');
}

export function Login() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<LoginAudience>('personal');
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [allowCredentialInput, setAllowCredentialInput] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setCurrentUser);
    return unsubscribe;
  }, []);

  const getRedirectPath = () => {
    const next = searchParams.get('next');
    if (next?.startsWith('/') && !next.startsWith('//')) return next;
    return activeTab === 'developer' ? '/admin' : '/';
  };

  const switchAudience = (audience: LoginAudience) => {
    setActiveTab(audience);
    setEmail('');
    setPassword('');
    setDisplayName('');
    setMessage('');
    setAllowCredentialInput(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!termsAccepted) {
      setMessage(isEnglish ? 'Please agree to the copyright and privacy notice first.' : '请先勾选同意版权声明及隐私声明。');
      return;
    }
    if (!email.trim() || !password) {
      setMessage(isEnglish ? 'Please enter email and password.' : '请输入邮箱和密码。');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    try {
      let signedInUser = auth.currentUser;
      if (authMode === 'register') {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim()) await updateProfile(result.user, { displayName: displayName.trim() });
        signedInUser = result.user;
      } else {
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        signedInUser = result.user;
      }
      if (signedInUser) await syncUserProfile(signedInUser).catch(() => undefined);
      navigate(getRedirectPath(), { replace: true });
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

        {currentUser && (
          <div className="mb-6 rounded-lg border border-fuchsia-300/18 bg-fuchsia-950/16 p-4 text-sm text-white/72">
            <p className="text-white/90">{isEnglish ? 'You are signed in.' : '当前已登录'}</p>
            <p className="mt-1 truncate text-xs text-white/52">{currentUser.email || currentUser.displayName || (isEnglish ? 'Email account' : '邮箱账号')}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => navigate('/')} className="rounded border border-white/12 px-3 py-2 text-xs hover:border-fuchsia-300/45 hover:text-white">
                {isEnglish ? 'Home' : '进入首页'}
              </button>
              <button type="button" onClick={() => navigate('/admin')} className="rounded border border-white/12 px-3 py-2 text-xs hover:border-fuchsia-300/45 hover:text-white">
                {isEnglish ? 'Admin' : '管理后台'}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await signOut(auth).catch(() => undefined);
                  setEmail('');
                  setPassword('');
                  setDisplayName('');
                  setMessage('');
                }}
                className="rounded border border-white/12 px-3 py-2 text-xs text-white/50 hover:border-white/30 hover:text-white"
              >
                {isEnglish ? 'Sign out' : '退出登录'}
              </button>
            </div>
          </div>
        )}

        <div className="mb-7 flex rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            type="button"
            onClick={() => switchAudience('personal')}
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
            onClick={() => switchAudience('developer')}
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
            onClick={() => setAuthMode('login')}
            className={
              'relative pb-3 text-sm font-medium tracking-widest transition-colors ' +
              (authMode === 'login' ? 'text-fuchsia-500' : 'text-white/50 hover:text-white/80')
            }
          >
            {isEnglish ? 'Email Login' : '邮箱登录'}
            {authMode === 'login' && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-fuchsia-500" />}
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={
              'relative pb-3 text-sm font-medium tracking-widest transition-colors ' +
              (authMode === 'register' ? 'text-fuchsia-500' : 'text-white/50 hover:text-white/80')
            }
          >
            {isEnglish ? 'Email Register' : '邮箱注册'}
            {authMode === 'register' && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-fuchsia-500" />}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
          <div className="space-y-4">
            {authMode === 'register' && (
              <input
                type="text"
                placeholder={isEnglish ? 'Display name' : '昵称'}
                className="w-full rounded-md border border-white/10 bg-transparent px-4 py-3 text-sm text-white transition-all placeholder:text-white/30 focus:border-fuchsia-600/50 focus:outline-none"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                autoComplete="off"
              />
            )}
            <input
              key={`${activeTab}-${authMode}-email`}
              type="email"
              name={`${activeTab}-${authMode}-email`}
              placeholder={isEnglish ? 'Email' : '邮箱'}
              className="w-full rounded-md border border-white/10 bg-transparent px-4 py-3 text-sm text-white transition-all placeholder:text-white/30 focus:border-fuchsia-600/50 focus:outline-none"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="off"
              data-lpignore="true"
              data-1p-ignore="true"
              readOnly={!allowCredentialInput}
              onFocus={() => setAllowCredentialInput(true)}
              required
            />
            <input
              key={`${activeTab}-${authMode}-password`}
              type="password"
              name={`${activeTab}-${authMode}-password`}
              placeholder={isEnglish ? 'Password' : authMode === 'register' ? '设置密码（至少 6 位）' : '请输入密码'}
              className="w-full rounded-md border border-white/10 bg-transparent px-4 py-3 text-sm text-white transition-all placeholder:text-white/30 focus:border-fuchsia-600/50 focus:outline-none"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              readOnly={!allowCredentialInput}
              onFocus={() => setAllowCredentialInput(true)}
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-white/20 bg-transparent text-fuchsia-600 accent-fuchsia-600 focus:ring-fuchsia-500"
            />
            <label htmlFor="terms" className="cursor-pointer text-xs text-white/50">
              {isEnglish ? 'I agree to ' : '阅读并同意'}
              <span className="text-fuchsia-500 hover:text-fuchsia-400">{isEnglish ? 'Copyright & Privacy Notice' : '《版权声明及隐私声明》'}</span>
            </label>
          </div>
          <p className="text-[11px] leading-5 text-white/35">
            {isEnglish
              ? 'After sign-in, saved patterns and basic visit records are stored only under your account for personal use and site maintenance.'
              : '登录后，收藏纹样与基础访问记录仅保存到当前账号，用于个人收藏和站点维护。'}
          </p>

          {message && <p className="rounded border border-fuchsia-500/20 bg-fuchsia-950/20 px-3 py-2 text-xs leading-5 text-fuchsia-100/85">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 py-3.5 text-sm font-medium tracking-widest text-white shadow-[0_0_26px_rgba(217,70,239,0.24)] transition-colors hover:from-purple-600 hover:via-fuchsia-500 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (isEnglish ? 'Processing...' : '处理中...') : authMode === 'register' ? (isEnglish ? 'Register' : '注册') : (isEnglish ? 'Login' : '登录')}
          </button>

          <div className="mt-6 flex items-center justify-between text-xs tracking-wider">
            <span className="text-white/40">
              {authMode === 'login' ? (isEnglish ? 'No account? ' : '没有账号？') : (isEnglish ? 'Have an account? ' : '已有账号？')}
              <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-fuchsia-500 transition-colors hover:text-fuchsia-400">
                {authMode === 'login' ? (isEnglish ? 'Register' : '立即注册') : (isEnglish ? 'Login' : '去登录')}
              </button>
            </span>
            {authMode === 'login' && (
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
