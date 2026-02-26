export const portfolioData = {
  about: {
    title: 'About Me',
    content: `
      <h2>About Me</h2>
      <p>Welcome to my interactive portfolio! I'm a passionate <strong>Full-Stack Developer</strong>
      with a love for creating immersive digital experiences. With years of experience in web development,
      3D graphics, and creative coding, I build products that stand out.</p>

      <h3>My Story</h3>
      <p>I started my journey in tech building simple websites and quickly fell in love with the power
      of code to create engaging user experiences. Today, I specialize in building modern web applications,
      3D interactive experiences, and scalable backend systems.</p>

      <h3>What I Do</h3>
      <p>I help companies bring their ideas to life through thoughtful engineering and creative problem-solving.
      From concept to deployment, I handle the full development lifecycle with a focus on performance,
      accessibility, and beautiful design.</p>
    `,
  },

  projects: {
    title: 'Projects',
    content: `
      <h2>Featured Projects</h2>

      <div class="project-card">
        <h3>E-Commerce Platform</h3>
        <p>A full-featured e-commerce platform with real-time inventory management,
        payment processing, and an AI-powered recommendation engine. Scaled to handle
        50K+ daily active users.</p>
        <div class="tech-tags">
          <span class="tech-tag">React</span>
          <span class="tech-tag">Node.js</span>
          <span class="tech-tag">PostgreSQL</span>
          <span class="tech-tag">Redis</span>
          <span class="tech-tag">Stripe</span>
        </div>
      </div>

      <div class="project-card">
        <h3>3D Data Visualization Dashboard</h3>
        <p>An interactive 3D dashboard that transforms complex datasets into stunning
        visual representations. Features real-time WebSocket data streaming and GPU-accelerated
        rendering for smooth performance.</p>
        <div class="tech-tags">
          <span class="tech-tag">Three.js</span>
          <span class="tech-tag">WebGL</span>
          <span class="tech-tag">D3.js</span>
          <span class="tech-tag">WebSocket</span>
        </div>
      </div>

      <div class="project-card">
        <h3>Social Fitness App</h3>
        <p>A mobile-first fitness application with social features, workout tracking,
        and gamification elements. Integrated with wearable devices via Bluetooth LE
        for real-time health monitoring.</p>
        <div class="tech-tags">
          <span class="tech-tag">React Native</span>
          <span class="tech-tag">Firebase</span>
          <span class="tech-tag">GraphQL</span>
          <span class="tech-tag">BLE</span>
        </div>
      </div>

      <div class="project-card">
        <h3>AI Content Generator</h3>
        <p>A SaaS platform that uses machine learning to generate marketing copy,
        blog posts, and social media content. Features A/B testing and analytics
        to optimize generated content performance.</p>
        <div class="tech-tags">
          <span class="tech-tag">Python</span>
          <span class="tech-tag">FastAPI</span>
          <span class="tech-tag">OpenAI</span>
          <span class="tech-tag">Vue.js</span>
          <span class="tech-tag">Docker</span>
        </div>
      </div>
    `,
  },

  skills: {
    title: 'Skills',
    content: `
      <h2>Skills & Technologies</h2>
      <p>Here are the technologies and tools I work with regularly:</p>

      <div class="skill-grid">
        <div class="skill-item">
          <div class="skill-icon">⚛</div>
          <div class="skill-name">React / Next.js</div>
          <div class="skill-level"><div class="skill-level-fill" style="width:95%"></div></div>
        </div>
        <div class="skill-item">
          <div class="skill-icon">🟢</div>
          <div class="skill-name">Node.js</div>
          <div class="skill-level"><div class="skill-level-fill" style="width:90%"></div></div>
        </div>
        <div class="skill-item">
          <div class="skill-icon">🎮</div>
          <div class="skill-name">Three.js / WebGL</div>
          <div class="skill-level"><div class="skill-level-fill" style="width:85%"></div></div>
        </div>
        <div class="skill-item">
          <div class="skill-icon">🐍</div>
          <div class="skill-name">Python</div>
          <div class="skill-level"><div class="skill-level-fill" style="width:88%"></div></div>
        </div>
        <div class="skill-item">
          <div class="skill-icon">🗄</div>
          <div class="skill-name">PostgreSQL / MongoDB</div>
          <div class="skill-level"><div class="skill-level-fill" style="width:85%"></div></div>
        </div>
        <div class="skill-item">
          <div class="skill-icon">🐳</div>
          <div class="skill-name">Docker / K8s</div>
          <div class="skill-level"><div class="skill-level-fill" style="width:80%"></div></div>
        </div>
        <div class="skill-item">
          <div class="skill-icon">☁</div>
          <div class="skill-name">AWS / GCP</div>
          <div class="skill-level"><div class="skill-level-fill" style="width:82%"></div></div>
        </div>
        <div class="skill-item">
          <div class="skill-icon">📱</div>
          <div class="skill-name">React Native</div>
          <div class="skill-level"><div class="skill-level-fill" style="width:78%"></div></div>
        </div>
      </div>
    `,
  },

  contact: {
    title: 'Contact',
    content: `
      <h2>Get In Touch</h2>
      <p>I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
      Let's build something amazing together!</p>

      <div class="contact-links">
        <a class="contact-link" href="mailto:hello@example.com">
          <span>📧</span>
          <div>
            <strong>Email</strong><br/>
            <span style="color:#aaa">hello@example.com</span>
          </div>
        </a>
        <a class="contact-link" href="#">
          <span>💼</span>
          <div>
            <strong>LinkedIn</strong><br/>
            <span style="color:#aaa">linkedin.com/in/yourprofile</span>
          </div>
        </a>
        <a class="contact-link" href="#">
          <span>🐙</span>
          <div>
            <strong>GitHub</strong><br/>
            <span style="color:#aaa">github.com/yourprofile</span>
          </div>
        </a>
        <a class="contact-link" href="#">
          <span>🐦</span>
          <div>
            <strong>Twitter / X</strong><br/>
            <span style="color:#aaa">@yourhandle</span>
          </div>
        </a>
      </div>
    `,
  },
};
