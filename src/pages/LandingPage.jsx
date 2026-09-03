import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Key, Users, BarChart3, Link2, Smartphone, Check, ArrowRight } from 'lucide-react'
import { useReveal } from '../hooks/useReveal'
import styles from './LandingPage.module.css'

const LANGS = ['C++', 'Python', 'PHP', 'Node.js', 'TypeScript', 'React', 'Rust', 'Go', 'C#', 'Java']

const FEATURES = [
  { icon: <Shield size={28} />, title: 'Xác thực an toàn', desc: 'Hệ thống xác thực mạnh mẽ với mã hóa end-to-end, bảo vệ ứng dụng của bạn khỏi các mối đe dọa.' },
  { icon: <Key size={28} />, title: 'Quản lý giấy phép', desc: 'Tạo, phân phối và quản lý giấy phép phần mềm một cách dễ dàng với hệ thống key linh hoạt.' },
  { icon: <Users size={28} />, title: 'Quản lý người dùng', desc: 'Theo dõi và quản lý người dùng, phiên đăng nhập, và hoạt động trong thời gian thực.' },
  { icon: <BarChart3 size={28} />, title: 'Phân tích thời gian thực', desc: 'Dashboard trực quan với số liệu thống kê chi tiết về ứng dụng và người dùng của bạn.' },
  { icon: <Link2 size={28} />, title: 'Webhooks & API', desc: 'Tích hợp dễ dàng với hệ thống của bạn thông qua webhooks và REST API mạnh mẽ.' },
  { icon: <Smartphone size={28} />, title: 'Đa nền tảng', desc: 'Hỗ trợ tất cả ngôn ngữ lập trình phổ biến với SDK và tài liệu đầy đủ.' },
]

const PLANS = [
  { name: 'Miễn phí', price: '$0', period: '/tháng', desc: 'Hoàn hảo để bắt đầu', features: ['1 ứng dụng', '100 người dùng', '500 giấy phép', 'API cơ bản', 'Hỗ trợ cộng đồng'], cta: 'Bắt đầu miễn phí', highlight: false },
  { name: 'Pro', price: '$15', period: '/tháng', desc: 'Dành cho nhà phát triển chuyên nghiệp', features: ['10 ứng dụng', '10,000 người dùng', 'Giấy phép không giới hạn', 'Webhooks', 'Hỗ trợ ưu tiên', 'Phân tích nâng cao'], cta: 'Dùng thử 14 ngày', highlight: true },
  { name: 'Enterprise', price: '$49', period: '/tháng', desc: 'Cho doanh nghiệp lớn', features: ['Ứng dụng không giới hạn', 'Người dùng không giới hạn', 'SLA 99.9%', 'Hỗ trợ 24/7', 'Tùy chỉnh theo yêu cầu', 'Triển khai riêng'], cta: 'Liên hệ chúng tôi', highlight: false },
]

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: Math.random() * 6 + 3,
  delay: Math.random() * 6,
  duration: Math.random() * 8 + 6,
  opacity: Math.random() * 0.5 + 0.2,
}))

function RevealBlock({ children, className, delay = 0 }) {
  const { ref, visible } = useReveal()
  const style = { animationDelay: `${delay}ms` }
  return (
    <div
      ref={ref}
      className={`${className || ''} ${styles.reveal} ${visible ? styles.revealVisible : ''}`}
      style={style}
    >
      {children}
    </div>
  )
}

function HeroSpotlight() {
  const ref = useRef(null)
  const [pos, setPos] = useState({ x: -200, y: -200 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      setPos({ x: e.clientX - r.left, y: e.clientY - r.top })
    }
    el.addEventListener('mousemove', onMove)
    return () => el.removeEventListener('mousemove', onMove)
  }, [])

  return <div ref={ref} className={styles.spotlight} style={{ background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.06) 40%, transparent 70%)` }} />
}

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.particles}>
        {PARTICLES.map(p => (
          <span key={p.id} className={styles.particle} style={{ left: `${p.left}%`, width: p.size, height: p.size, opacity: p.opacity, animationDelay: `${p.delay}s`, animationDuration: `${p.duration}s` }} />
        ))}
      </div>

      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link to="/" className={styles.logo}>KeyAuth</Link>
          <div className={styles.navLinks}>
            <a href="#features">Đặc trưng</a>
            <a href="#pricing">Giá cả</a>
            <a href="#docs">Tài liệu</a>
            <a href="#blog">Blog</a>
            <a href="#support">Hỗ trợ</a>
          </div>
          <div className={styles.navActions}>
            <Link to="/login" className={styles.btnOutline}>Đăng nhập</Link>
            <Link to="/register" className={styles.btnPrimary}>Đăng ký</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <HeroSpotlight />
        <div className={styles.heroBg}>
          <div className={styles.heroBgBlob1} />
          <div className={styles.heroBgBlob2} />
        </div>
        <div className={styles.heroContent}>
          <RevealBlock>
            <div className={styles.heroChip}><span className={styles.heroChipDot} /> KeyAuth Platform v2</div>
          </RevealBlock>
          <RevealBlock delay={100}>
            <h1 className={styles.heroTitle}>
              Giải pháp xác thực dành cho<br />
              <span className={styles.heroAccent}>tất cả mọi người!</span>
            </h1>
          </RevealBlock>
          <RevealBlock delay={200}>
            <p className={styles.heroDesc}>
              Giải pháp xác thực an toàn, có khả năng mở rộng và mang tính đột phá cho ứng dụng của bạn.
              Bắt đầu chỉ trong vài phút với các API và SDK mạnh mẽ của chúng tôi.
            </p>
          </RevealBlock>
          <RevealBlock delay={300}>
            <div className={styles.heroCtas}>
              <Link to="/register" className={styles.btnPrimary}>
                Bắt đầu miễn phí <ArrowRight size={16} />
              </Link>
              <a href="#docs" className={styles.btnOutline}>Xem tài liệu</a>
            </div>
          </RevealBlock>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.dashboardPreview}>
            <div className={styles.previewBar}>
              <span className={styles.dot} style={{background:'#f85149'}} />
              <span className={styles.dot} style={{background:'#d29922'}} />
              <span className={styles.dot} style={{background:'#3fb950'}} />
              <span className={styles.previewTitle}>KeyAuth Dashboard</span>
            </div>
            <div className={styles.previewBody}>
              <div className={styles.previewSidebar}>
                {['Ứng dụng','Giấy phép','Người dùng','Đăng ký','Biến số','Webhooks'].map((item, i) => (
                  <div key={i} className={`${styles.previewSideItem} ${i===0?styles.active:''}`}>{item}</div>
                ))}
              </div>
              <div className={styles.previewMain}>
                <div className={styles.previewStats}>
                  {[['1','Ứng dụng'],['13','Người dùng'],['0','Tạm dừng'],['2','Phiên']].map(([n,l],i)=>(
                    <div key={i} className={styles.previewStat}>
                      <span className={styles.previewStatNum}>{n}</span>
                      <span className={styles.previewStatLabel}>{l}</span>
                    </div>
                  ))}
                </div>
                <div className={styles.previewCard}>
                  <div className={styles.previewCardTitle}>MỘT</div>
                  <div className={styles.previewCardBadge}>Tích cực</div>
                  <div className={styles.previewCardRow}>Phiên bản: 1.0 · Người dùng: 13</div>
                </div>
                <div className={styles.previewCard}>
                  <div className={styles.previewCardTitle}>APP_TWO</div>
                  <div className={styles.previewCardBadge} style={{background:'rgba(63,185,80,0.15)',color:'#3fb950'}}>Hoạt động</div>
                  <div className={styles.previewCardRow}>Phiên bản: 2.1 · Người dùng: 47</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lang strip */}
      <RevealBlock>
        <div className={styles.langStrip}>
          <p className={styles.langLabel}>Tích hợp vào bất kỳ ngôn ngữ lập trình nào.</p>
          <div className={styles.langList}>
            {LANGS.map(l => <span key={l} className={styles.langBadge}>{l}</span>)}
          </div>
        </div>
      </RevealBlock>

      {/* Features */}
      <section id="features" className={styles.section}>
        <RevealBlock>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tại sao chọn KeyAuth?</h2>
            <p className={styles.sectionDesc}>Mọi thứ bạn cần để bảo vệ và quản lý phần mềm của mình</p>
          </div>
        </RevealBlock>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <RevealBlock key={i} delay={i * 90} className={styles.featureCardWrap}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  {f.icon}
                  <span className={styles.spark} style={{ top: '6%', left: '12%', color: '#a855f7', '--sx': '-14px', '--sy': '-16px' }} />
                  <span className={styles.spark} style={{ top: '85%', left: '8%', color: '#ec4899', '--sx': '-8px', '--sy': '14px' }} />
                  <span className={styles.spark} style={{ top: '10%', right: '10%', color: '#06b6d4', '--sx': '12px', '--sy': '-12px' }} />
                  <span className={styles.spark} style={{ bottom: '8%', right: '12%', color: '#6366f1', '--sx': '14px', '--sy': '12px' }} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            </RevealBlock>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={styles.section}>
        <RevealBlock>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Bảng giá đơn giản</h2>
            <p className={styles.sectionDesc}>Không có phí ẩn. Hủy bất cứ lúc nào.</p>
          </div>
        </RevealBlock>
        <div className={styles.pricingGrid}>
          {PLANS.map((plan, i) => (
            <RevealBlock key={i} delay={i * 120} className={styles.pricingWrap}>
              <div className={`${styles.pricingCard} ${plan.highlight ? styles.pricingHighlight : ''}`}>
                {plan.highlight && <div className={styles.popularBadge}>Phổ biến nhất</div>}
                <div className={styles.planName}>{plan.name}</div>
                <div className={styles.planPrice}>
                  {plan.price}<span className={styles.planPeriod}>{plan.period}</span>
                </div>
                <p className={styles.planDesc}>{plan.desc}</p>
                <ul className={styles.planFeatures}>
                  {plan.features.map((f, j) => (
                    <li key={j} className={styles.planFeature}>
                      <span className={styles.checkIcon}><Check size={16} /></span> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={plan.highlight ? styles.btnPrimary : styles.btnOutline}>
                  {plan.cta}
                </Link>
              </div>
            </RevealBlock>
          ))}
        </div>
      </section>

      {/* CTA */}
      <RevealBlock>
        <section className={styles.ctaSection}>
          <h2 className={styles.ctaTitle}>Sẵn sàng bắt đầu?</h2>
          <p className={styles.ctaDesc}>Tham gia cùng hàng nghìn nhà phát triển đang sử dụng KeyAuth</p>
          <Link to="/register" className={styles.btnPrimary}>Tạo tài khoản miễn phí <ArrowRight size={16} /></Link>
        </section>
      </RevealBlock>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <span className={styles.logo}>KeyAuth</span>
            <p>Giải pháp xác thực cho mọi nhà phát triển.</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerCol}>
              <h4>Sản phẩm</h4>
              <a href="#">Đặc trưng</a>
              <a href="#">Giá cả</a>
              <a href="#">Tài liệu</a>
            </div>
            <div className={styles.footerCol}>
              <h4>Công ty</h4>
              <a href="#">Về chúng tôi</a>
              <a href="#">Blog</a>
              <a href="#">Liên hệ</a>
            </div>
            <div className={styles.footerCol}>
              <h4>Pháp lý</h4>
              <a href="#">Điều khoản</a>
              <a href="#">Bảo mật</a>
              <a href="#">Cookie</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 KeyAuth. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
