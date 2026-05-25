/* ===========================================================
   DG CONTABILIDADE — Scripts
   Funcionalidades: navbar, mobile menu, animações, contadores,
   FAQ, calculadoras (DAS, INSS, Pró-labore), formulário
   =========================================================== */

(() => {
  'use strict';

  /* ============== Page Loader ============== */
  window.addEventListener('load', () => {
    const loader = document.getElementById('page-loader');
    if (loader) {
      setTimeout(() => loader.classList.add('is-hidden'), 200);
    }
  });

  /* ============== Navbar Scroll ============== */
  const navbar = document.getElementById('navbar');
  const scrollTopBtn = document.getElementById('scroll-top');

  const handleScroll = () => {
    const scrolled = window.scrollY > 24;
    if (navbar) navbar.classList.toggle('scrolled', scrolled);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('show', window.scrollY > 480);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============== Mobile Menu ============== */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ============== Active Nav (scroll spy) ============== */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-item');

  const setActiveNav = () => {
    const offset = 140;
    let current = 'home';
    sections.forEach((sec) => {
      const top = sec.offsetTop - offset;
      if (window.scrollY >= top) current = sec.id;
    });
    navItems.forEach((item) => {
      item.classList.toggle('active', item.getAttribute('href') === `#${current}`);
    });
  };
  window.addEventListener('scroll', setActiveNav, { passive: true });

  /* ============== Reveal on scroll (IntersectionObserver) ============== */
  const revealItems = [
    '.section-header',
    '.service-card',
    '.diff-card',
    '.about-visual',
    '.about-content',
    '.contact-info',
    '.contact-form-wrapper',
    '.faq-aside',
    '.faq-item',
    '.calc-panel-wrapper',
    '.calc-tabs',
  ];
  document.querySelectorAll(revealItems.join(',')).forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 6) * 80}ms`;
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ============== Counters (Stats Strip) ============== */
  const counters = document.querySelectorAll('.strip-num');
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.dataset.target;
        const duration = 1600;
        const start = performance.now();
        const update = (t) => {
          const p = Math.min((t - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(eased * target).toString();
          if (p < 1) requestAnimationFrame(update);
          else el.textContent = target.toString();
        };
        requestAnimationFrame(update);
        counterIO.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((c) => counterIO.observe(c));

  /* ============== Calculadoras — Tabs ============== */
  const tabs = document.querySelectorAll('.calc-tab');
  const panels = document.querySelectorAll('.calc-panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach((t) => t.classList.toggle('active', t === tab));
      panels.forEach((p) =>
        p.classList.toggle('active', p.dataset.panel === target)
      );
    });
  });

  /* ============== Helpers ============== */
  const fmtBRL = (n) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const errorMsg = (msg) =>
    `<div class="result-error"><i class="fa-solid fa-triangle-exclamation"></i> ${msg}</div>`;

  /* ============== Calculadora DAS — Anexo III ============== */
  /* Tabela Anexo III (vigente) */
  const dasAnexoIII = [
    { ate: 180000,    aliq: 0.06,   ded: 0       },
    { ate: 360000,    aliq: 0.112,  ded: 9360    },
    { ate: 720000,    aliq: 0.135,  ded: 17640   },
    { ate: 1800000,   aliq: 0.16,   ded: 35640   },
    { ate: 3600000,   aliq: 0.21,   ded: 125640  },
    { ate: 4800000,   aliq: 0.33,   ded: 648000  },
  ];

  const dasBtn = document.getElementById('calc-das-btn');
  if (dasBtn) {
    dasBtn.addEventListener('click', () => {
      const fatMes = parseFloat(document.getElementById('das-fat-mes').value);
      const rbt12 = parseFloat(document.getElementById('das-fat-ano').value);
      const out = document.getElementById('das-result');

      if (!fatMes || fatMes <= 0 || isNaN(fatMes)) {
        out.innerHTML = errorMsg('Informe um faturamento mensal válido.');
        return;
      }
      if (!rbt12 || rbt12 < 0 || isNaN(rbt12)) {
        out.innerHTML = errorMsg('Informe o faturamento dos últimos 12 meses (RBT12).');
        return;
      }
      if (rbt12 > 4800000) {
        out.innerHTML = errorMsg('Faturamento acima do limite do Simples Nacional (R$ 4.800.000,00).');
        return;
      }

      const faixa = dasAnexoIII.find((f) => rbt12 <= f.ate) || dasAnexoIII[5];
      // Alíquota efetiva: ((RBT12 * aliq) - dedução) / RBT12
      const aliqEfetiva = rbt12 > 0 ? ((rbt12 * faixa.aliq) - faixa.ded) / rbt12 : faixa.aliq;
      const aliqEfetivaSafe = Math.max(0, aliqEfetiva);
      const das = fatMes * aliqEfetivaSafe;

      out.innerHTML = `
        <div class="result-box">
          <h4>Estimativa de DAS</h4>
          <div class="result-value">${fmtBRL(das)}</div>
          <p class="result-detail">Valor estimado do DAS para o mês informado.</p>
        </div>
        <div class="result-box" style="border-left-color:var(--accent);">
          <div class="result-row"><span>Faturamento do mês</span><strong>${fmtBRL(fatMes)}</strong></div>
          <div class="result-row"><span>RBT12</span><strong>${fmtBRL(rbt12)}</strong></div>
          <div class="result-row"><span>Faixa nominal</span><strong>${(faixa.aliq * 100).toFixed(2)}%</strong></div>
          <div class="result-row"><span>Parcela a deduzir</span><strong>${fmtBRL(faixa.ded)}</strong></div>
          <div class="result-row"><span>Alíquota efetiva</span><strong>${(aliqEfetivaSafe * 100).toFixed(2)}%</strong></div>
        </div>
      `;
    });
  }

  /* ============== Calculadora INSS Empregado (progressivo) ============== */
  /* Tabela INSS 2024 (referência) */
  const inssFaixas = [
    { ate: 1412.00,  aliq: 0.075 },
    { ate: 2666.68,  aliq: 0.09  },
    { ate: 4000.03,  aliq: 0.12  },
    { ate: 7786.02,  aliq: 0.14  },
  ];
  const tetoINSS = 7786.02;

  const calcInssProgressivo = (salario) => {
    const sal = Math.min(salario, tetoINSS);
    let inss = 0;
    let limAnt = 0;
    for (const f of inssFaixas) {
      if (sal > f.ate) {
        inss += (f.ate - limAnt) * f.aliq;
        limAnt = f.ate;
      } else {
        inss += (sal - limAnt) * f.aliq;
        limAnt = sal;
        break;
      }
    }
    return Math.max(0, inss);
  };

  const inssBtn = document.getElementById('calc-inss-btn');
  if (inssBtn) {
    inssBtn.addEventListener('click', () => {
      const sal = parseFloat(document.getElementById('inss-salario').value);
      const out = document.getElementById('inss-result');

      if (!sal || sal <= 0 || isNaN(sal)) {
        out.innerHTML = errorMsg('Informe um salário válido.');
        return;
      }

      const inss = calcInssProgressivo(sal);
      const aliqEfetiva = (inss / sal) * 100;
      const liquido = sal - inss;

      out.innerHTML = `
        <div class="result-box">
          <h4>Desconto de INSS</h4>
          <div class="result-value">${fmtBRL(inss)}</div>
          <p class="result-detail">Alíquota efetiva: <strong>${aliqEfetiva.toFixed(2)}%</strong></p>
        </div>
        <div class="result-box" style="border-left-color:var(--accent);">
          <div class="result-row"><span>Salário bruto</span><strong>${fmtBRL(sal)}</strong></div>
          <div class="result-row"><span>(-) INSS</span><strong>- ${fmtBRL(inss)}</strong></div>
          <div class="result-row"><span>Salário líquido (sem IRRF)</span><strong>${fmtBRL(liquido)}</strong></div>
        </div>
      `;
    });
  }

  /* ============== Calculadora Pró-labore Líquido ============== */
  /* Tabela IRRF 2024 (referência simplificada) */
  const irrfFaixas = [
    { ate: 2259.20,  aliq: 0.000, ded: 0       },
    { ate: 2826.65,  aliq: 0.075, ded: 169.44  },
    { ate: 3751.05,  aliq: 0.150, ded: 381.44  },
    { ate: 4664.68,  aliq: 0.225, ded: 662.77  },
    { ate: Infinity, aliq: 0.275, ded: 896.00  },
  ];
  const deducaoDependente = 189.59;

  const calcIRRF = (base) => {
    if (base <= 0) return 0;
    const faixa = irrfFaixas.find((f) => base <= f.ate);
    return Math.max(0, base * faixa.aliq - faixa.ded);
  };

  const plBtn = document.getElementById('calc-pl-btn');
  if (plBtn) {
    plBtn.addEventListener('click', () => {
      const bruto = parseFloat(document.getElementById('pl-bruto').value);
      const dep = parseInt(document.getElementById('pl-dependentes').value || '0', 10);
      const out = document.getElementById('pl-result');

      if (!bruto || bruto <= 0 || isNaN(bruto)) {
        out.innerHTML = errorMsg('Informe um valor válido para o pró-labore.');
        return;
      }

      // INSS contribuinte individual: 11% até teto
      const inss = Math.min(bruto, tetoINSS) * 0.11;
      const baseIR = bruto - inss - dep * deducaoDependente;
      const irrf = calcIRRF(baseIR);
      const liquido = bruto - inss - irrf;

      out.innerHTML = `
        <div class="result-box">
          <h4>Pró-labore líquido</h4>
          <div class="result-value">${fmtBRL(liquido)}</div>
          <p class="result-detail">Após INSS (11%) e IRRF.</p>
        </div>
        <div class="result-box" style="border-left-color:var(--accent);">
          <div class="result-row"><span>Pró-labore bruto</span><strong>${fmtBRL(bruto)}</strong></div>
          <div class="result-row"><span>(-) INSS (11%)</span><strong>- ${fmtBRL(inss)}</strong></div>
          <div class="result-row"><span>Dependentes (${dep})</span><strong>- ${fmtBRL(dep * deducaoDependente)}</strong></div>
          <div class="result-row"><span>Base de cálculo IRRF</span><strong>${fmtBRL(Math.max(0, baseIR))}</strong></div>
          <div class="result-row"><span>(-) IRRF</span><strong>- ${fmtBRL(irrf)}</strong></div>
        </div>
      `;
    });
  }

  /* ============== Máscara simples para telefone ============== */
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach((input) => {
    input.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 10) {
        v = v.replace(/(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
      } else if (v.length > 6) {
        v = v.replace(/(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
      } else if (v.length > 2) {
        v = v.replace(/(\d{2})(\d{0,5}).*/, '($1) $2');
      } else if (v.length > 0) {
        v = v.replace(/(\d*)/, '($1');
      }
      e.target.value = v.trim();
    });
  });

  /* ============== Formulário de contato ============== */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const success = document.getElementById('form-success');
      const submitBtn = document.getElementById('submit-btn');

      // Validação simples
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach((field) => {
        if (!field.value.trim()) {
          field.style.borderColor = '#dc2626';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });
      if (!valid) return;

      const data = new FormData(form);
      const name = (data.get('name') || '').trim();
      const phone = (data.get('phone') || '').trim();
      const email = (data.get('email') || '').trim();
      const company = (data.get('company') || '').trim();
      const service = (data.get('service') || '').trim();
      const message = (data.get('message') || '').trim();

      const whatsappMessage = [
        'Ola! Vim pelo site da DG Contabilidade e gostaria de atendimento.',
        '',
        `Nome: ${name}`,
        `WhatsApp: ${phone}`,
        `E-mail: ${email}`,
        company ? `Empresa: ${company}` : '',
        service ? `Servico de interesse: ${service}` : '',
        message ? `Mensagem: ${message}` : '',
      ].filter(Boolean).join('\n');

      const whatsappUrl = `https://wa.me/5594992073389?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank', 'noopener');

      if (success) success.classList.add('show');
    });
  }

  /* ============== Ano dinâmico no rodapé ============== */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
