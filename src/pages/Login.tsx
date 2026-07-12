import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Code, User } from 'lucide-react';

export function Login() {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'personal' | 'developer'>('personal');
  const [loginMethod, setLoginMethod] = useState<'password' | 'sms'>('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(activeTab === 'developer' ? '/admin' : '/');
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

      <div className="login-card relative z-10 w-full max-w-[320px] rounded-xl bg-[#121316]/88 p-7 shadow-2xl backdrop-blur-xl">
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
              (loginMethod === 'password' ? 'text-fuchsia-600' : 'text-white/50 hover:text-white/80')
            }
          >
            {isEnglish ? 'Password' : '密码登录'}
            {loginMethod === 'password' && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-fuchsia-600" />}
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('sms')}
            className={
              'relative pb-3 text-sm font-medium tracking-widest transition-colors ' +
              (loginMethod === 'sms' ? 'text-fuchsia-600' : 'text-white/50 hover:text-white/80')
            }
          >
            {isEnglish ? 'SMS' : '短信登录'}
            {loginMethod === 'sms' && <div className="absolute bottom-0 left-0 h-[2px] w-full bg-fuchsia-600" />}
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <input
              type="text"
              placeholder={loginMethod === 'password' ? (isEnglish ? 'Phone / Account' : '手机号 / 账号') : (isEnglish ? 'Phone' : '手机号')}
              className="w-full rounded-md border border-white/10 bg-transparent px-4 py-3 text-sm text-white transition-all placeholder:text-white/30 focus:border-fuchsia-600/50 focus:outline-none"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
            {loginMethod === 'password' ? (
              <input
                type="password"
                placeholder={isEnglish ? 'Password' : '请输入密码'}
                className="w-full rounded-md border border-white/10 bg-transparent px-4 py-3 text-sm text-white transition-all placeholder:text-white/30 focus:border-fuchsia-600/50 focus:outline-none"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={isEnglish ? 'Verification code' : '请输入验证码'}
                  className="flex-1 rounded-md border border-white/10 bg-transparent px-4 py-3 text-sm text-white transition-all placeholder:text-white/30 focus:border-fuchsia-600/50 focus:outline-none"
                  required
                />
                <button type="button" className="whitespace-nowrap rounded-md bg-white/5 px-4 py-3 text-sm text-white/80 transition-colors hover:bg-white/10">
                  {isEnglish ? 'Get Code' : '获取验证码'}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="terms" required className="h-4 w-4 cursor-pointer rounded border-white/20 bg-transparent text-fuchsia-600 accent-fuchsia-600 focus:ring-fuchsia-500" />
            <label htmlFor="terms" className="cursor-pointer text-xs text-white/50">
              {isEnglish ? 'I agree to ' : '阅读并同意 '}
              <span className="text-fuchsia-500 hover:text-fuchsia-400">{isEnglish ? 'Copyright & Privacy Notice' : '《版权声明及隐私声明》'}</span>
            </label>
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 py-3.5 text-sm font-medium tracking-widest text-white shadow-[0_0_26px_rgba(217,70,239,0.24)] transition-colors hover:from-purple-600 hover:via-fuchsia-500 hover:to-pink-500"
          >
            {isEnglish ? 'Login' : '登录'}
          </button>

          <div className="mt-6 flex items-center justify-between text-xs tracking-wider">
            <span className="text-white/40">
              {isEnglish ? 'No account? ' : '没有账号？'}
              <button type="button" className="text-fuchsia-500 transition-colors hover:text-fuchsia-400">{isEnglish ? 'Register' : '立即注册'}</button>
            </span>
            <button type="button" className="text-white/40 transition-colors hover:text-white">
              {isEnglish ? 'Forgot password' : '忘记密码'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
