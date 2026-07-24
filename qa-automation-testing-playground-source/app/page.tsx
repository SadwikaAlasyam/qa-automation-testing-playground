const focusAreas = [
  { number: "01", title: "AI fluency", copy: "Learning how modern AI tools can improve the way I think, work, and build." },
  { number: "02", title: "Automation quality", copy: "Exploring reliable, repeatable testing practices and thoughtful product quality." },
  { number: "03", title: "Creative practice", copy: "Painting keeps me curious, observant, and comfortable with experimentation." },
];

export default function Home() {
  return (
    <main id="main-content" data-testid="qa-automation-testing-playground">
      <nav className="nav" aria-label="Primary navigation" data-testid="primary-nav">
        <a className="mark" href="#top" aria-label="Sadwika Alasyam home">SA<span>.</span></a>
        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#focus">Focus</a>
          <a href="/qa-lab">QA Lab</a>
          <a href="/advanced-qa">Advanced QA</a>
        </div>
        <a className="nav-cta" href="mailto:sadwika2404@gmail.com" data-testid="nav-contact">Let&apos;s connect</a>
      </nav>

      <section className="hero" id="top" data-testid="hero-section">
        <div className="eyebrow"><span aria-hidden="true" /> Built by Sadwika Alasyam</div>
        <h1>QA Automation<br /><em>Testing Playground</em></h1>
        <div className="hero-bottom">
          <p>Practice realistic scenarios across <strong>UI automation, APIs, databases, accessibility, and reliability.</strong></p>
          <div className="hero-actions">
            <a className="button primary" href="/qa-lab" data-testid="explore-button">Start testing <span aria-hidden="true">→</span></a>
            <a className="button text-button" href="https://github.com/SadwikaAlasyam" target="_blank" rel="noreferrer" data-testid="github-link">GitHub <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="orb orb-one" aria-hidden="true" /><div className="orb orb-two" aria-hidden="true" />
      </section>

      <section className="about section" id="about" data-testid="about-section">
        <p className="section-label">About me</p>
        <div className="about-grid">
          <h2>A curious mind with a bias for <span>forward motion.</span></h2>
          <div className="about-copy">
            <p>I&apos;m Sadwika—a continuous learner focused on growing my capabilities in artificial intelligence and automation testing. I enjoy turning unfamiliar ideas into practical skills, one thoughtful experiment at a time.</p>
            <p>Beyond technology, painting gives me another language for exploration. It sharpens my eye for detail and reminds me that strong results come from both discipline and imagination.</p>
          </div>
        </div>
      </section>

      <section className="focus section" id="focus" data-testid="focus-section">
        <div className="section-heading">
          <p className="section-label">Where I&apos;m growing</p>
          <h2>Learning with intention.</h2>
        </div>
        <div className="focus-grid">
          {focusAreas.map((item) => (
            <article className="focus-card" key={item.number} data-testid={`focus-card-${item.number}`}>
              <span>{item.number}</span><h3>{item.title}</h3><p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="qa-teaser section" data-testid="qa-lab-teaser">
        <p className="section-label light">Automation practice</p>
        <div>
          <h2>Ready for a more complex test?</h2>
          <p>Open a dedicated QA environment with frames, popups, asynchronous states, tables, forms, and stable selectors.</p>
          <div className="qa-page-actions">
            <a className="button primary" href="/qa-lab" data-testid="open-qa-lab">Launch QA Lab <span aria-hidden="true">→</span></a>
            <a className="button advanced-button" href="/advanced-qa" data-testid="open-advanced-qa">Advanced QA <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <footer data-testid="site-footer">
        <div><p className="section-label">Start a conversation</p><h2>Let&apos;s learn and build<br /><em>something meaningful.</em></h2></div>
        <a className="email-link" href="mailto:sadwika2404@gmail.com" data-testid="email-link">sadwika2404@gmail.com <span aria-hidden="true">↗</span></a>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Sadwika Alasyam</span><a href="https://github.com/SadwikaAlasyam" target="_blank" rel="noreferrer">GitHub</a></div>
      </footer>
    </main>
  );
}
