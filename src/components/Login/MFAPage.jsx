import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { apiMFAVerify } from '../../api/auth'

export default function MFAPage() {
  const { tempToken, setToken, logout } = useStore()
  const [code, setCode]     = useState(['', '', '', '', '', ''])
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const inputs = useRef([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  const handleChange = (idx, val) => {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[idx] = digit
    setCode(next)
    if (digit && idx < 5) inputs.current[idx + 1]?.focus()
    if (next.every(d => d)) verify(next.join(''))
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const next = pasted.split('')
      setCode(next)
      inputs.current[5]?.focus()
      verify(pasted)
    }
  }

  const verify = async (otp) => {
    setError('')
    setLoading(true)
    try {
      const data = await apiMFAVerify(tempToken, otp)
      setToken(data.access_token)
    } catch (err) {
      setError(err.message)
      setCode(['', '', '', '', '', ''])
      setTimeout(() => inputs.current[0]?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                <polyline points="16 7 22 7 22 13"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Finly</span>
          </div>
          <p className="text-sm text-gray-400">AI 주식 투자 어시스턴트</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="10" rx="2" ry="2"/>
                <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">2단계 인증</h2>
          </div>
          <p className="text-sm text-gray-400 mb-7 ml-11">Google Authenticator의 6자리 코드를 입력하세요</p>

          {/* OTP Inputs */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(idx, e.target.value)}
                onKeyDown={e => handleKeyDown(idx, e)}
                disabled={loading}
                className={`w-11 h-13 text-center text-xl font-semibold border-2 rounded-xl outline-none transition-all
                  ${digit ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-gray-50 text-gray-900'}
                  focus:border-gray-900 focus:bg-white focus:text-gray-900
                  disabled:opacity-50`}
                style={{ height: '52px' }}
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-4 py-3 mb-4 text-center">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center text-sm text-gray-400 mb-4">인증 중...</div>
          )}

          <button
            onClick={handleBack}
            className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
          >
            ← 로그인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
