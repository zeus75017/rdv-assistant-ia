import { Link } from 'react-router-dom'
import styles from './Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <span className={styles.logoText}>Rendevo</span>
        </Link>
        <div className={styles.navLinks}>
          <a href="#features">Fonctionnalites</a>
          <a href="#how">Comment ca marche</a>
          <a href="#pricing">Tarifs</a>
        </div>
        <div className={styles.navButtons}>
          <Link to="/login" className={styles.btnLogin}>Se connecter</Link>
          <Link to="/register" className={styles.btnStart}>Commencer gratuitement</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot}></span>
            Nouveau : IA conversationnelle avancee
          </div>
          <h1>
            L'assistant qui prend vos <span className={styles.highlight}>rendez-vous</span> a votre place
          </h1>
          <p className={styles.heroSubtitle}>
            Rendevo appelle les professionnels pour vous et negocie le meilleur creneau.
            Gagnez des heures chaque semaine.
          </p>
          <div className={styles.heroActions}>
            <Link to="/register" className={styles.btnPrimary}>
              Essayer gratuitement
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <button className={styles.btnDemo}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Voir la demo
            </button>
          </div>
          <div className={styles.heroTrust}>
            <div className={styles.avatars}>
              <div className={styles.avatar} style={{background: '#3b82f6'}}>JD</div>
              <div className={styles.avatar} style={{background: '#10b981'}}>ML</div>
              <div className={styles.avatar} style={{background: '#f59e0b'}}>AS</div>
              <div className={styles.avatar} style={{background: '#ef4444'}}>PK</div>
            </div>
            <span>+2,500 professionnels nous font confiance</span>
          </div>
        </div>

        <div className={styles.heroVisual}>
          {/* Widget Dashboard Preview */}
          <div className={styles.dashboardPreview}>
            <div className={styles.widgetHeader}>
              <div className={styles.widgetDots}>
                <span></span><span></span><span></span>
              </div>
              <span>Dashboard Rendevo</span>
            </div>

            <div className={styles.widgetsGrid}>
              {/* Stats Widget */}
              <div className={styles.widget}>
                <div className={styles.widgetTitle}>Appels ce mois</div>
                <div className={styles.widgetValue}>47</div>
                <div className={styles.widgetTrend}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M23 6l-9.5 9.5-5-5L1 18"/>
                  </svg>
                  +23%
                </div>
              </div>

              {/* Success Widget */}
              <div className={styles.widget}>
                <div className={styles.widgetTitle}>Taux de succes</div>
                <div className={styles.widgetValue}>94%</div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{width: '94%'}}></div>
                </div>
              </div>

              {/* Recent Calls Widget */}
              <div className={`${styles.widget} ${styles.widgetLarge}`}>
                <div className={styles.widgetTitle}>Derniers appels</div>
                <div className={styles.callsList}>
                  <div className={styles.callItem}>
                    <div className={styles.callInfo}>
                      <div className={styles.callName}>Dr. Martin</div>
                      <div className={styles.callTime}>Il y a 2 min</div>
                    </div>
                    <div className={`${styles.callStatus} ${styles.statusSuccess}`}>Confirme</div>
                  </div>
                  <div className={styles.callItem}>
                    <div className={styles.callInfo}>
                      <div className={styles.callName}>Cabinet Durand</div>
                      <div className={styles.callTime}>Il y a 15 min</div>
                    </div>
                    <div className={`${styles.callStatus} ${styles.statusSuccess}`}>Confirme</div>
                  </div>
                  <div className={styles.callItem}>
                    <div className={styles.callInfo}>
                      <div className={styles.callName}>Clinique St-Jean</div>
                      <div className={styles.callTime}>Il y a 1h</div>
                    </div>
                    <div className={`${styles.callStatus} ${styles.statusPending}`}>En attente</div>
                  </div>
                </div>
              </div>

              {/* Time Saved Widget */}
              <div className={styles.widget}>
                <div className={styles.widgetTitle}>Temps economise</div>
                <div className={styles.widgetValue}>12h</div>
                <div className={styles.widgetSubtext}>cette semaine</div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className={`${styles.floatingCard} ${styles.floatingCard1}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>RDV confirme pour 14h</span>
          </div>
          <div className={`${styles.floatingCard} ${styles.floatingCard2}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#3b82f6">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
            <span>Appel en cours...</span>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className={styles.logos}>
        <p>Ils utilisent Rendevo pour leurs rendez-vous</p>
        <div className={styles.logosGrid}>
          <div className={styles.logoItem}>TechCorp</div>
          <div className={styles.logoItem}>MediGroup</div>
          <div className={styles.logoItem}>LegalPro</div>
          <div className={styles.logoItem}>FinanceHub</div>
          <div className={styles.logoItem}>ConsultCo</div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Fonctionnalites</span>
          <h2>Tout ce qu'il vous faut pour gagner du temps</h2>
          <p>Une solution complete qui automatise vos prises de rendez-vous de A a Z</p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <h3>Configuration simple</h3>
            <p>Entrez les informations du rendez-vous souhaite et laissez l'IA faire le reste.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <h3>Disponible 24h/24</h3>
            <p>Programmez vos demandes a tout moment, l'IA appelle aux heures d'ouverture.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h3>Conversation naturelle</h3>
            <p>L'IA parle francais parfaitement et s'adapte a chaque interlocuteur.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h3>Synchronisation agenda</h3>
            <p>Vos rendez-vous sont automatiquement ajoutes a votre calendrier.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <h3>Notifications temps reel</h3>
            <p>Soyez informe instantanement du resultat de chaque appel.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h3>100% securise</h3>
            <p>Vos donnees sont chiffrees et protegees selon les normes RGPD.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className={styles.howItWorks}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Comment ca marche</span>
          <h2>3 etapes pour ne plus jamais attendre au telephone</h2>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Renseignez les details</h3>
              <p>Indiquez le nom du professionnel, le numero et vos disponibilites.</p>
            </div>
            <div className={styles.stepVisual}>
              <div className={styles.formPreview}>
                <div className={styles.formField}><span>Dentiste Dr. Martin</span></div>
                <div className={styles.formField}><span>01 23 45 67 89</span></div>
                <div className={styles.formField}><span>Lundi ou Mardi matin</span></div>
              </div>
            </div>
          </div>

          <div className={styles.stepConnector}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>L'IA passe l'appel</h3>
              <p>Notre assistant intelligent appelle et negocie le meilleur creneau pour vous.</p>
            </div>
            <div className={styles.stepVisual}>
              <div className={styles.callAnimation}>
                <div className={styles.callWave}></div>
                <div className={styles.callIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.stepConnector}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>

          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>RDV confirme !</h3>
              <p>Recevez une notification avec tous les details de votre rendez-vous.</p>
            </div>
            <div className={styles.stepVisual}>
              <div className={styles.confirmationCard}>
                <div className={styles.confirmIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div className={styles.confirmText}>Mardi 14h - Dr. Martin</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionBadge}>Tarifs</span>
          <h2>Un prix adapte a chaque besoin</h2>
          <p>Sans engagement, annulez a tout moment</p>
        </div>

        <div className={styles.pricingGrid}>
          <div className={styles.pricingCard}>
            <div className={styles.pricingHeader}>
              <h3>Starter</h3>
              <p>Pour les particuliers</p>
            </div>
            <div className={styles.pricingPrice}>
              <span className={styles.amount}>9</span>
              <span className={styles.currency}>EUR</span>
              <span className={styles.period}>/mois</span>
            </div>
            <ul className={styles.pricingFeatures}>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                20 appels par mois
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Tableau de bord
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Notifications email
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Support email
              </li>
            </ul>
            <Link to="/register?plan=starter" className={styles.pricingBtn}>
              Commencer
            </Link>
          </div>

          <div className={`${styles.pricingCard} ${styles.pricingCardPopular}`}>
            <div className={styles.popularBadge}>Populaire</div>
            <div className={styles.pricingHeader}>
              <h3>Pro</h3>
              <p>Pour les professionnels</p>
            </div>
            <div className={styles.pricingPrice}>
              <span className={styles.amount}>29</span>
              <span className={styles.currency}>EUR</span>
              <span className={styles.period}>/mois</span>
            </div>
            <ul className={styles.pricingFeatures}>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                100 appels par mois
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Tableau de bord avance
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Notifications SMS + email
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Historique complet
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Support prioritaire
              </li>
            </ul>
            <Link to="/register?plan=pro" className={styles.pricingBtnPrimary}>
              Essai gratuit 14 jours
            </Link>
          </div>

          <div className={styles.pricingCard}>
            <div className={styles.pricingHeader}>
              <h3>Business</h3>
              <p>Pour les equipes</p>
            </div>
            <div className={styles.pricingPrice}>
              <span className={styles.amount}>99</span>
              <span className={styles.currency}>EUR</span>
              <span className={styles.period}>/mois</span>
            </div>
            <ul className={styles.pricingFeatures}>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                500 appels par mois
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Multi-utilisateurs
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                API access
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Integrations CRM
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                Account manager
              </li>
            </ul>
            <Link to="/register?plan=business" className={styles.pricingBtn}>
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>Pret a gagner du temps ?</h2>
          <p>Rejoignez les milliers de professionnels qui automatisent leurs prises de rendez-vous.</p>
          <Link to="/register" className={styles.ctaBtn}>
            Commencer gratuitement
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
              </div>
              <span className={styles.logoText}>Rendevo</span>
            </div>
            <p>L'assistant IA qui revolutionne la prise de rendez-vous.</p>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Produit</h4>
              <a href="#features">Fonctionnalites</a>
              <a href="#pricing">Tarifs</a>
              <a href="#">API</a>
              <a href="#">Changelog</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Entreprise</h4>
              <a href="#">A propos</a>
              <a href="#">Blog</a>
              <a href="#">Carrieres</a>
              <a href="#">Contact</a>
            </div>
            <div className={styles.footerColumn}>
              <h4>Legal</h4>
              <a href="#">CGU</a>
              <a href="#">Confidentialite</a>
              <a href="#">RGPD</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>2024 Rendevo. Tous droits reserves.</p>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Twitter">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
