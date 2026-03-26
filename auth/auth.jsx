/* ═══════════════════════════════════════════════════════════════
   RAYMAX — auth.jsx
   React 18 via CDN  |  No import/export  |  Firebase compat
   ═══════════════════════════════════════════════════════════════ */

const { useState, useEffect, useRef } = React;

/* ─── HELPERS ──────────────────────────────────────────────────── */

/** Evaluate password strength → "weak" | "medium" | "strong" */
function passwordStrength(pw) {
  if (!pw) return null;
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  const hasUpper   = /[A-Z]/.test(pw);
  const hasDigit   = /\d/.test(pw);
  const score = (pw.length >= 6 ? 1 : 0)
              + (pw.length >= 10 ? 1 : 0)
              + (hasSpecial ? 1 : 0)
              + (hasUpper   ? 1 : 0)
              + (hasDigit   ? 1 : 0);
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}

const strengthColor = { weak: '#ff3b30', medium: '#ff9f0a', strong: '#34c759' };
const strengthLabel = { weak: 'Weak',    medium: 'Medium',  strong: 'Strong'  };
const strengthPct   = { weak: '33%',     medium: '66%',     strong: '100%'    };

/** Simple spinner SVG */
function Spinner() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         style={{ animation: 'spin 0.8s linear infinite', verticalAlign: 'middle' }}>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.35)" strokeWidth="3"/>
      <path   d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

/* ─── STEP DOTS ────────────────────────────────────────────────── */
function StepDots({ step, total }) {
  return (
    <div className="step-dots">
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const cls = n < step ? 'step-dot done' : n === step ? 'step-dot active' : 'step-dot';
        return <div key={n} className={cls} />;
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT: ForgotPasswordView
   ═══════════════════════════════════════════════════════════════ */
function ForgotPasswordView({ onBack, initialEmail }) {
  const [email,   setEmail]   = useState(initialEmail || '');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [sent,    setSent]    = useState(false);

  async function handleReset() {
    setError('');
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await window.auth.sendPasswordResetEmail(email);
      setSent(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Back */}
      <button className="auth-link" style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onClick={onBack}>
        ← Back
      </button>

      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>Reset Password</h2>
      <p style={{ fontSize: '.82rem', color: '#9097b8', marginBottom: 18 }}>
        We'll send a reset link to your email.
      </p>

      {sent && (
        <div className="auth-success">Reset link sent! Check your email ✅</div>
      )}
      {error && <div className="auth-error">{error}</div>}

      <label className="auth-label">Email Address</label>
      <div className="auth-input-wrap">
        <input className="auth-input" type="email" placeholder="you@example.com"
               value={email} onChange={e => setEmail(e.target.value)} />
      </div>

      <button className="auth-btn" onClick={handleReset} disabled={loading || sent}>
        {loading ? <Spinner /> : sent ? 'Email Sent ✓' : 'Send Reset Link'}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT: PhoneSignInView
   ─ Uses invisible reCAPTCHA (single-init via ref)
   ─ Saves user to Firestore on successful verify
   ═══════════════════════════════════════════════════════════════ */
function PhoneSignInView({ onBack }) {
  const [countryCode,     setCountryCode]     = useState('+91');
  const [phone,           setPhone]           = useState('');
  const [otpSent,         setOtpSent]         = useState(false);
  const [otp,             setOtp]             = useState(['', '', '', '', '', '']);
  const [loading,         setLoading]         = useState(false);
  const [verifying,       setVerifying]       = useState(false);
  const [error,           setError]           = useState('');
  const [resendTimer,     setResendTimer]     = useState(0);

  // Keep confirmationResult in a ref so it survives re-renders
  const confirmationRef  = useRef(null);
  // Keep reCAPTCHA verifier instance in a ref to avoid duplicate inits
  const recaptchaRef     = useRef(null);
  const otpRefs          = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  /* ── Resend countdown ── */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  /* ── Destroy reCAPTCHA on unmount to keep DOM clean ── */
  useEffect(() => {
    return () => {
      destroyRecaptcha();
    };
  }, []);

  /* ── Helper: safely destroy existing reCAPTCHA instance ── */
  function destroyRecaptcha() {
    try {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    } catch (_) {
      recaptchaRef.current = null;
    }
    // Also wipe the global safety net
    if (window.recaptchaVerifier) {
      try { window.recaptchaVerifier.clear(); } catch (_) {}
      window.recaptchaVerifier = null;
    }
  }

  /* ── sendOTP(phoneNumber) ── */
  async function sendOTP(fullNumber) {
    // Destroy any stale verifier first so we never double-init
    destroyRecaptcha();

    // Create fresh invisible reCAPTCHA bound to #recaptcha-container
    const verifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      size: 'invisible',
      callback: () => {},          // reCAPTCHA solved automatically
      'expired-callback': () => {  // Reset on token expiry
        destroyRecaptcha();
        setError('reCAPTCHA expired. Please try again.');
        setLoading(false);
      }
    });

    recaptchaRef.current    = verifier;
    window.recaptchaVerifier = verifier; // global fallback

    const confirmation = await window.auth.signInWithPhoneNumber(fullNumber, verifier);
    confirmationRef.current = confirmation;
  }

  /* ── verifyOTP(code) ── */
  async function verifyOTP(code) {
    if (!confirmationRef.current) throw new Error('No OTP session found. Please resend.');
    const result = await confirmationRef.current.confirm(code);

    if (result.user) {
      // Upsert user doc in Firestore
      await window.db.collection('users').doc(result.user.uid).set({
        uid:         result.user.uid,
        phone:       result.user.phoneNumber,
        displayName: result.user.displayName || '',
        lastLogin:   firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      window.location.href = '../index.html';
    }
  }

  /* ── Handle Send button ── */
  async function handleSendOtp() {
    setError('');
    const digits = phone.trim().replace(/\D/g, '');
    if (digits.length < 7) { setError('Enter a valid phone number.'); return; }

    setLoading(true);
    try {
      await sendOTP(countryCode + digits);
      setOtpSent(true);
      setResendTimer(30);
      // Auto-focus first OTP box
      setTimeout(() => { if (otpRefs[0].current) otpRefs[0].current.focus(); }, 100);
    } catch (e) {
      destroyRecaptcha(); // ensure cleanup on error
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* ── Handle Resend button ── */
  async function handleResend() {
    if (resendTimer > 0) return;
    setError('');
    setOtp(['', '', '', '', '', '']);
    await handleSendOtp();
  }

  /* ── OTP box key handling — auto-advance + backspace ── */
  function handleOtpChange(e, idx) {
    const digit = e.target.value.replace(/\D/g, '').slice(-1);
    const next  = [...otp];
    next[idx]   = digit;
    setOtp(next);
    if (digit && idx < 5) otpRefs[idx + 1].current.focus();
  }

  function handleOtpKeyDown(e, idx) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs[idx - 1].current.focus();
    }
  }

  /* ── Handle Verify button ── */
  async function handleVerify() {
    setError('');
    const code = otp.join('');
    if (code.length < 6) { setError('Enter the complete 6-digit OTP.'); return; }

    setVerifying(true);
    try {
      await verifyOTP(code);
    } catch (e) {
      setError(e.message || 'OTP verification failed. Please try again.');
      // Reset OTP boxes so user can retype
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => { if (otpRefs[0].current) otpRefs[0].current.focus(); }, 50);
    } finally {
      setVerifying(false);
    }
  }

  /* ── Render ── */
  return (
    <div>
      {/* Back */}
      <button className="auth-link"
              style={{ marginBottom: 16, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              onClick={onBack}>
        ← Back to Sign In
      </button>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>📱 Phone Sign In</h2>
      <p style={{ fontSize: '.82rem', color: '#9097b8', marginBottom: 18 }}>
        We'll send a one-time password to your phone.
      </p>

      {error && <div className="auth-error">{error}</div>}

      {!otpSent ? (
        /* ── Step 1: Phone number entry ── */
        <>
          <label className="auth-label">Phone Number</label>
          <div className="phone-wrap">
            <input className="phone-code" type="text"
                   value={countryCode}
                   onChange={e => setCountryCode(e.target.value)}
                   maxLength={5} />
            <input className="auth-input" type="tel" placeholder="9876543210"
                   value={phone}
                   onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                   onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                   style={{ flex: 1 }} />
          </div>

          <button className="auth-btn" onClick={handleSendOtp} disabled={loading}>
            {loading ? <Spinner /> : 'Send OTP 📲'}
          </button>
        </>
      ) : (
        /* ── Step 2: OTP entry ── */
        <>
          <div className="auth-success" style={{ marginBottom: 12 }}>
            OTP sent to {countryCode}{phone} ✅
          </div>

          <label className="auth-label" style={{ textAlign: 'center', display: 'block' }}>
            Enter 6-digit OTP
          </label>

          <div className="otp-grid">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={otpRefs[i]}
                className="otp-box"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e  => handleOtpChange(e, i)}
                onKeyDown={e => handleOtpKeyDown(e, i)}
              />
            ))}
          </div>

          <button className="auth-btn" onClick={handleVerify}
                  disabled={verifying || otp.join('').length < 6}>
            {verifying ? <Spinner /> : 'Verify OTP ✓'}
          </button>

          <button className="auth-btn-sec" onClick={handleResend}
                  disabled={resendTimer > 0 || loading}
                  style={{ marginTop: 10 }}>
            {loading
              ? <Spinner />
              : resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : 'Resend OTP'}
          </button>
        </>
      )}

      {/* Invisible reCAPTCHA anchor — must always be in the DOM */}
      <div id="recaptcha-container" style={{ position: 'absolute', bottom: 0 }}></div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════
   COMPONENT: MobileSignInView
   Custom Firestore-based login — no Firebase Auth, no OTP.
   Stores session in localStorage for dashboard access.
   ═══════════════════════════════════════════════════════════════ */
function MobileSignInView({ onSwitchToEmail }) {
  const [mobile,   setMobile]   = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleMobileLogin(e) {
    e.preventDefault();
    setError('');
    const digits = mobile.replace(/\D/g, '');
    if (digits.length < 10) { setError('Enter a valid 10-digit mobile number.'); return; }
    if (!password)           { setError('Password is required.'); return; }

    setLoading(true);
    try {
      // Query the dedicated mobile-users collection
      const snap = await window.db.collection('users_mobile')
        .where('mobile', '==', digits).limit(1).get();

      if (snap.empty) {
        setError('No account found with this mobile number. Please sign up first.');
        return;
      }

      const docData = snap.docs[0].data();
      if (docData.password !== password) {
        setError('Incorrect password. Please try again.');
        return;
      }

      // Store a lightweight session token in localStorage (uid + mobile only)
      localStorage.setItem('raymax-mobile-user', JSON.stringify({
        uid:         snap.docs[0].id,
        fullName:    docData.fullName || '',
        mobile:      docData.mobile,
        loginMethod: 'mobile',
      }));

      window.location.href = '../index.html';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleMobileLogin} noValidate>
      {error && <div className="auth-error">{error}</div>}

      <label className="auth-label">Mobile Number</label>
      <div className="auth-input-wrap">
        <input className="auth-input" type="tel" placeholder="9876543210"
               value={mobile}
               onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
               maxLength={10} autoComplete="tel" />
      </div>

      <label className="auth-label">Password</label>
      <div className="auth-input-wrap">
        <input className="auth-input" type={showPass ? 'text' : 'password'}
               placeholder="••••••••" value={password}
               onChange={e => setPassword(e.target.value)}
               style={{ paddingRight: 44 }} autoComplete="current-password" />
        <button type="button" className="auth-input-icon"
                aria-label="Toggle password" onClick={() => setShowPass(s => !s)}>
          {showPass ? '🙈' : '👁️'}
        </button>
      </div>

      <button className="auth-btn" type="submit" disabled={loading}>
        {loading ? <Spinner /> : '📱 Sign In with Mobile'}
      </button>

      <div className="auth-divider" style={{ marginTop: 16 }}>or</div>
      <button type="button" className="auth-btn-sec"
              style={{ marginTop: 8 }}
              onClick={onSwitchToEmail}>
        📧 Sign in with Email
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT: MobileSignUpView
   1-step signup: saves {fullName, mobile, password} to Firestore.
   Checks for duplicate mobile before saving.
   ═══════════════════════════════════════════════════════════════ */
function MobileSignUpView({ onSwitchToEmail }) {
  const [fullName,    setFullName]    = useState('');
  const [mobile,      setMobile]      = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [done,        setDone]        = useState(false);

  const strength = passwordStrength(password);

  async function handleMobileSignUp(e) {
    e.preventDefault();
    setError('');
    const digits = mobile.replace(/\D/g, '');
    if (!fullName.trim())    { setError('Full name is required.');                   return; }
    if (digits.length < 10)  { setError('Enter a valid 10-digit mobile number.');   return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPass) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      // Check if mobile already exists in users_mobile collection
      const snap = await window.db.collection('users_mobile')
        .where('mobile', '==', digits).limit(1).get();

      if (!snap.empty) {
        setError('An account with this mobile number already exists. Please sign in.');
        return;
      }

      // Save to dedicated users_mobile collection
      const ref = await window.db.collection('users_mobile').add({
        fullName:    fullName.trim(),
        mobile:      digits,
        password,                          // NOTE: plain-text per project requirement
        type:        'mobile_user',        // collection type tag
        loginMethod: 'mobile',
        createdAt:   firebase.firestore.FieldValue.serverTimestamp(),
      });

      // Lightweight session token in localStorage (uid + mobile only — not the password)
      localStorage.setItem('raymax-mobile-user', JSON.stringify({
        uid:         ref.id,
        fullName:    fullName.trim(),
        mobile:      digits,
        loginMethod: 'mobile',
      }));

      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div className="success-icon">✅</div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '16px 0 8px' }}>Account Created!</h2>
        <p style={{ fontSize: '.88rem', color: '#9097b8', marginBottom: 24 }}>
          You're all set. Welcome to RAYMAX!
        </p>
        <button className="auth-btn" onClick={() => { window.location.href = '../index.html'; }}>
          Go to Dashboard →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleMobileSignUp} noValidate>
      {error && <div className="auth-error">{error}</div>}

      <label className="auth-label">Full Name</label>
      <div className="auth-input-wrap">
        <input className="auth-input" type="text" placeholder="Ray Maxwell"
               value={fullName} onChange={e => setFullName(e.target.value)}
               autoComplete="name" />
      </div>

      <label className="auth-label">Mobile Number</label>
      <div className="auth-input-wrap">
        <input className="auth-input" type="tel" placeholder="9876543210"
               value={mobile}
               onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
               maxLength={10} autoComplete="tel" />
      </div>

      <label className="auth-label">Password</label>
      <div className="auth-input-wrap">
        <input className="auth-input" type={showPass ? 'text' : 'password'}
               placeholder="min 6 characters" value={password}
               onChange={e => setPassword(e.target.value)}
               style={{ paddingRight: 44 }} autoComplete="new-password" />
        <button type="button" className="auth-input-icon" onClick={() => setShowPass(s => !s)}>
          {showPass ? '🙈' : '👁️'}
        </button>
      </div>

      {strength && (
        <div style={{ marginTop: -8, marginBottom: 14 }}>
          <div style={{ height: 4, borderRadius: 10, background: 'rgba(0,0,0,.07)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 10,
              width: strengthPct[strength],
              background: strengthColor[strength],
              transition: 'width .4s ease, background .4s ease'
            }} />
          </div>
          <span style={{ fontSize: '.72rem', color: strengthColor[strength], fontWeight: 600 }}>
            {strengthLabel[strength]} password
          </span>
        </div>
      )}

      <label className="auth-label">Confirm Password</label>
      <div className="auth-input-wrap">
        <input className="auth-input" type={showConfirm ? 'text' : 'password'}
               placeholder="••••••••" value={confirmPass}
               onChange={e => setConfirmPass(e.target.value)}
               style={{ paddingRight: 44 }} autoComplete="new-password" />
        <button type="button" className="auth-input-icon" onClick={() => setShowConfirm(s => !s)}>
          {showConfirm ? '🙈' : '👁️'}
        </button>
      </div>

      <button className="auth-btn" type="submit" disabled={loading}>
        {loading ? <Spinner /> : '📱 Create Mobile Account'}
      </button>

      <div className="auth-divider" style={{ marginTop: 16 }}>or</div>
      <button type="button" className="auth-btn-sec"
              style={{ marginTop: 8 }}
              onClick={onSwitchToEmail}>
        📧 Sign up with Email
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT: SignInView
   loginMethod: 'email' (default) | 'phone' (custom Firestore login)
   ═══════════════════════════════════════════════════════════════ */
function SignInView() {
  const [loginMethod, setLoginMethod] = useState('email');  // 'email' | 'phone'
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [showForgot,  setShowForgot]  = useState(false);

  /* ── Forgot password view ── */
  if (showForgot) {
    return <ForgotPasswordView onBack={() => setShowForgot(false)} initialEmail={email} />;
  }

  /* ── Mobile login view ── */
  if (loginMethod === 'phone') {
    return <MobileSignInView onSwitchToEmail={() => setLoginMethod('email')} />;
  }

  /* ── Email sign-in handler ── */
  async function handleSignIn(e) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await window.auth.signInWithEmailAndPassword(email, password);
      window.location.href = '../index.html';
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSignIn} noValidate>
      {error && <div className="auth-error">{error}</div>}

      {/* Email */}
      <label className="auth-label">Email Address</label>
      <div className="auth-input-wrap">
        <input id="signin-email" className="auth-input" type="email"
               placeholder="you@example.com" value={email}
               onChange={e => setEmail(e.target.value)} autoComplete="email" />
      </div>

      {/* Password */}
      <label className="auth-label">Password</label>
      <div className="auth-input-wrap">
        <input id="signin-password" className="auth-input" style={{ paddingRight: 44 }}
               type={showPass ? 'text' : 'password'} placeholder="••••••••"
               value={password} onChange={e => setPassword(e.target.value)}
               autoComplete="current-password" />
        <button type="button" className="auth-input-icon" aria-label="Toggle password"
                onClick={() => setShowPass(s => !s)}>
          {showPass ? '🙈' : '👁️'}
        </button>
      </div>

      {/* Remember me + Forgot */}
      <div className="auth-row">
        <label className="auth-check-label">
          <input type="checkbox" /> Remember me
        </label>
        <button type="button" className="auth-link" onClick={() => setShowForgot(true)}>
          Forgot password?
        </button>
      </div>

      {/* Submit */}
      <button id="signin-submit" className="auth-btn" type="submit" disabled={loading}>
        {loading ? <Spinner /> : '🔑 Sign In to RAYMAX'}
      </button>

      {/* Mobile login switch */}
      <div className="auth-divider" style={{ marginTop: 16 }}>or</div>
      <button type="button" className="auth-btn-sec"
              onClick={() => setLoginMethod('phone')}>
        📱 Sign in with Mobile Number
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT: SignUpView
   signupMethod: 'email' (3-step) | 'mobile' (1-step Firestore)
   ═══════════════════════════════════════════════════════════════ */
function SignUpView() {
  const [signupMethod, setSignupMethod] = useState('email'); // 'email' | 'mobile'
  const [step,        setStep]        = useState(1);

  /* Step 1 state */
  const [fullName,    setFullName]    = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  /* Step 2 state */
  const [checking,    setChecking]    = useState(false);
  const [verifyErr,   setVerifyErr]   = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const strength = passwordStrength(password);

  /* Countdown timer for resend button */
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  /* ── Step 1: Create account ── */
  async function handleCreateAccount(e) {
    e.preventDefault();
    setError('');

    if (!fullName.trim())               { setError('Full name is required.');               return; }
    if (!email.includes('@') || !email.includes('.')) { setError('Enter a valid email.');   return; }
    if (password.length < 6)            { setError('Password must be at least 6 chars.');   return; }
    if (password !== confirmPass)        { setError('Passwords do not match.');              return; }

    setLoading(true);
    try {
      const cred = await window.auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: fullName });
      await cred.user.sendEmailVerification();
      await window.db.collection('users').doc(cred.user.uid).set({
        fullName,
        email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid: cred.user.uid
      });
      setResendTimer(30);
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  /* ── Step 2: Check verification ── */
  async function handleCheckVerified() {
    setVerifyErr('');
    setChecking(true);
    try {
      await window.auth.currentUser.reload();
      if (window.auth.currentUser.emailVerified) {
        setStep(3);
      } else {
        setVerifyErr('Email not verified yet. Please check your inbox.');
      }
    } catch (e) {
      setVerifyErr(e.message);
    } finally {
      setChecking(false);
    }
  }

  /* ── Step 2: Resend verification ── */
  async function handleResend() {
    if (resendTimer > 0) return;
    try {
      await window.auth.currentUser.sendEmailVerification();
      setResendTimer(30);
    } catch (e) {
      setVerifyErr(e.message);
    }
  }

  /* ─── Render ─── */
  return (
    <div>
      {/* ── Method toggle (only on step 1 of email signup) ── */}
      {(signupMethod === 'mobile' || step === 1) && (
        <div style={{
          display: 'flex', background: 'rgba(120,120,128,.1)',
          borderRadius: 40, padding: 4, gap: 4, marginBottom: 18
        }}>
          {[['email', '📧 Email'], ['mobile', '📱 Mobile']].map(([m, label]) => (
            <button
              key={m}
              type="button"
              onClick={() => { setSignupMethod(m); setError(''); setStep(1); }}
              style={{
                flex: 1, padding: '8px 0', border: 'none', borderRadius: 36,
                fontFamily: 'inherit', fontSize: '.82rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all .25s',
                background: signupMethod === m ? 'rgba(255,255,255,.85)' : 'transparent',
                color: signupMethod === m ? '#12131a' : '#9097b8',
                boxShadow: signupMethod === m ? '0 2px 10px rgba(0,0,0,.1)' : 'none',
              }}
            >{label}</button>
          ))}
        </div>
      )}

      {/* ── Mobile signup ── */}
      {signupMethod === 'mobile' && (
        <MobileSignUpView onSwitchToEmail={() => setSignupMethod('email')} />
      )}

      {/* ── Email signup (3-step) ── */}
      {signupMethod === 'email' && (
        <>
          <StepDots step={step} total={3} />

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <form onSubmit={handleCreateAccount} noValidate>
              {error && <div className="auth-error">{error}</div>}

              {/* Full Name */}
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrap">
                <input id="signup-name" className="auth-input" type="text"
                       placeholder="Ray Maxwell" value={fullName}
                       onChange={e => setFullName(e.target.value)} autoComplete="name" />
              </div>

              {/* Email */}
              <label className="auth-label">Email Address</label>
              <div className="auth-input-wrap">
                <input id="signup-email" className="auth-input" type="email"
                       placeholder="you@example.com" value={email}
                       onChange={e => setEmail(e.target.value)} autoComplete="email" />
              </div>

              {/* Password + strength */}
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <input id="signup-password" className="auth-input" style={{ paddingRight: 44 }}
                       type={showPass ? 'text' : 'password'} placeholder="min 6 characters"
                       value={password} onChange={e => setPassword(e.target.value)}
                       autoComplete="new-password" />
                <button type="button" className="auth-input-icon" aria-label="Toggle password"
                        onClick={() => setShowPass(s => !s)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Strength bar */}
              {strength && (
                <div style={{ marginTop: -8, marginBottom: 14 }}>
                  <div style={{ height: 4, borderRadius: 10, background: 'rgba(0,0,0,.07)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 10,
                      width: strengthPct[strength],
                      background: strengthColor[strength],
                      transition: 'width .4s ease, background .4s ease'
                    }} />
                  </div>
                  <span style={{ fontSize: '.72rem', color: strengthColor[strength], fontWeight: 600 }}>
                    {strengthLabel[strength]} password
                  </span>
                </div>
              )}

              {/* Confirm Password */}
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrap">
                <input id="signup-confirm" className="auth-input" style={{ paddingRight: 44 }}
                       type={showConfirm ? 'text' : 'password'} placeholder="••••••••"
                       value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                       autoComplete="new-password" />
                <button type="button" className="auth-input-icon" aria-label="Toggle confirm password"
                        onClick={() => setShowConfirm(s => !s)}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>

              <button id="signup-submit" className="auth-btn" type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Continue →'}
              </button>
            </form>
          )}

          {/* ── STEP 2 — Email Verification ── */}
          {step === 2 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: 12, animation: 'popIn .5s cubic-bezier(.34,1.6,.64,1) both' }}>
                📧
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8 }}>Verify Your Email</h2>
              <p style={{ fontSize: '.83rem', color: '#9097b8', marginBottom: 12 }}>
                We sent a verification link to:
              </p>
              <div style={{
                display: 'inline-block', padding: '6px 16px', borderRadius: 100,
                background: 'rgba(0,122,255,.1)', color: '#007aff',
                fontSize: '.85rem', fontWeight: 600, marginBottom: 14
              }}>
                {email}
              </div>
              <p style={{ fontSize: '.82rem', color: '#9097b8', marginBottom: 20 }}>
                Open your email and click the verification link to continue.
              </p>

              {verifyErr && <div className="auth-error">{verifyErr}</div>}

              <button id="check-verified-btn" className="auth-btn" onClick={handleCheckVerified}
                      disabled={checking}>
                {checking ? <Spinner /> : "I've verified my email ✓"}
              </button>

              <button className="auth-btn-sec" onClick={handleResend}
                      disabled={resendTimer > 0} style={{ marginTop: 10 }}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Email'}
              </button>

              <p style={{ fontSize: '.72rem', color: '#9097b8', marginTop: 14 }}>
                📂 Check spam folder if not received
              </p>
            </div>
          )}

          {/* ── STEP 3 — Success ── */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div className="success-icon">✅</div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '16px 0 8px' }}>
                Welcome to RAYMAX!
              </h2>
              <p style={{ fontSize: '.88rem', color: '#9097b8', marginBottom: 24 }}>
                Your account is ready. Start tracking solar energy.
              </p>
              <button id="go-to-dashboard-btn" className="auth-btn"
                      onClick={() => { window.location.href = '../index.html'; }}>
                Go to Dashboard →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ROOT COMPONENT: App
   ═══════════════════════════════════════════════════════════════ */
function App() {
  const [activeTab, setActiveTab] = useState('signin');
  const [theme,     setTheme]     = useState(() => {
    return localStorage.getItem('raymax-theme') || 'light';
  });

  /* Apply theme to <html> data-theme attribute */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('raymax-theme', theme);
  }, [theme]);

  /* Session guard — redirect if already logged in */
  useEffect(() => {
    const unsubscribe = window.auth.onAuthStateChanged(user => {
      if (user && user.emailVerified) {
        window.location.href = '../index.html';
      }
    });
    return () => unsubscribe();
  }, []);

  function toggleTheme() {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  }

  return (
    <>
      {/* ── Animated background blobs ── */}
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />

      {/* ── Auth card ── */}
      <div className="auth-card">

        {/* Theme toggle */}
        <button id="theme-toggle" className="theme-toggle" onClick={toggleTheme}
                aria-label="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div className="auth-logo-box" aria-label="RAYMAX logo"><img src="../logo.png" alt="RAYMAX logo" /></div>
          <div>
            <div className="auth-title">RAYMAX</div>
            <div className="auth-sub">Solar Tracking System</div>
          </div>
        </div>

        {/* Segmented tabs */}
        <div className="auth-tabs" role="tablist">
          <button id="tab-signin" className={`auth-tab${activeTab === 'signin' ? ' active' : ''}`}
                  role="tab" aria-selected={activeTab === 'signin'}
                  onClick={() => setActiveTab('signin')}>
            🔑 Sign In
          </button>
          <button id="tab-signup" className={`auth-tab${activeTab === 'signup' ? ' active' : ''}`}
                  role="tab" aria-selected={activeTab === 'signup'}
                  onClick={() => setActiveTab('signup')}>
            🚀 Sign Up
          </button>
        </div>

        {/* Active view */}
        {activeTab === 'signin' ? <SignInView /> : <SignUpView />}

        {/* Footer */}
        <div className="auth-footer">
          <span className="auth-footer-text">
            <span className="auth-footer-dot" aria-hidden="true" />
            RAYMAX — Solar Tracking System
          </span>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOUNT
   ═══════════════════════════════════════════════════════════════ */
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
