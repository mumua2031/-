import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, User, Code } from 'lucide-react';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'personal' | 'developer'>('personal');
  const [loginMethod, setLoginMethod] = useState<'password' | 'sms'>('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'developer') {
      navigate('/admin');
    } else {
      // In a real app, go to user profile
      navigate('/');
    }
  };

  return (
    <div className="login-page min-h-screen relative flex items-center justify-center bg-[#08090a] overflow-hidden px-4">
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url('/login-pattern-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          transform: 'scale(1.08)',
          filter: 'blur(12px) brightness(0.64) contrast(1.28) saturate(1.08)'
        }}
      />
      
      <button onClick={() => navigate(-1)} className="absolute top-8 left-8 text-white/60 hover:text-white transition-colors flex items-center gap-2 text-sm z-10">
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      <div className="login-card relative z-10 w-full max-w-[320px] p-7 bg-[#121316]/88 backdrop-blur-xl rounded-xl shadow-2xl">
        <div className="text-center mb-7">
          <h1 className="text-4xl font-bold text-fuchsia-700 tracking-[0.2em] mb-3" style={{ fontFamily: 'serif' }}>
            绣艺境
          </h1>
          <p className="text-xs text-fuchsia-700/60 tracking-[0.4em] uppercase font-serif">· 非 遗 汉 绣 ·</p>
        </div>

        <div className="flex bg-white/5 rounded-lg p-1 mb-7 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'personal' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            个人
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('developer')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'developer' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            开发者
          </button>
        </div>

        <div className="flex justify-center gap-8 mb-7 border-b border-white/10">
          <button
            onClick={() => setLoginMethod('password')}
            className={`pb-3 text-sm font-medium transition-colors relative tracking-widest ${
              loginMethod === 'password' ? 'text-fuchsia-600' : 'text-white/50 hover:text-white/80'
            }`}
          >
            密码登录
            {loginMethod === 'password' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-fuchsia-600"></div>}
          </button>
          <button
            onClick={() => setLoginMethod('sms')}
            className={`pb-3 text-sm font-medium transition-colors relative tracking-widest ${
              loginMethod === 'sms' ? 'text-fuchsia-600' : 'text-white/50 hover:text-white/80'
            }`}
          >
            短信登录
            {loginMethod === 'sms' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-fuchsia-600"></div>}
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder={loginMethod === 'password' ? '手机号 / 账号' : '手机号'} 
              className="w-full bg-transparent border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-fuchsia-600/50 transition-all placeholder:text-white/30 rounded-md"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            {loginMethod === 'password' ? (
              <input 
                type="password" 
                placeholder="请输入密码" 
                className="w-full bg-transparent border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-fuchsia-600/50 transition-all placeholder:text-white/30 rounded-md"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            ) : (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="请输入验证码" 
                  className="flex-1 bg-transparent border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-fuchsia-600/50 transition-all placeholder:text-white/30 rounded-md"
                  required
                />
                <button type="button" className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white/80 text-sm rounded-md transition-colors whitespace-nowrap">
                  获取验证码
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="terms" required className="w-4 h-4 rounded border-white/20 bg-transparent text-fuchsia-600 focus:ring-fuchsia-500 accent-fuchsia-600 cursor-pointer" />
            <label htmlFor="terms" className="text-xs text-white/50 cursor-pointer">
              阅读并同意 <span className="text-fuchsia-500 hover:text-fuchsia-400">《版权声明及隐私声明》</span>
            </label>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 hover:from-purple-600 hover:via-fuchsia-500 hover:to-pink-500 text-white font-medium tracking-widest py-3.5 rounded text-sm transition-colors mt-2 shadow-[0_0_26px_rgba(217,70,239,0.24)]"
          >
            登录
          </button>
          
          <div className="flex justify-between items-center mt-6 text-xs tracking-wider">
            <span className="text-white/40">
              没有账号？ <button type="button" className="text-fuchsia-500 hover:text-fuchsia-400 transition-colors">立即注册</button>
            </span>
            <button type="button" className="text-white/40 hover:text-white transition-colors">
              忘记密码
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
