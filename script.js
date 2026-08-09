(function () {
  var SPIN_SPEED = 1;
  var ROLES = ['Full Stack Developer', 'Cloud Enthusiast', 'DevOps Engineer'];
  var TYPE_MS = 55;       // delay per character while typing
  var DELETE_MS = 30;     // delay per character while deleting
  var HOLD_MS = 900;      // pause once fully typed
  var GAP_MS = 300;       // pause once fully deleted, before next word

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initRoleCycler();
    initContactForm();
    initCursor();
    bootThree();
  });

  function initMobileMenu() {
    var burger = document.querySelector('[data-nav-burger]');
    var menu = document.getElementById('mobileMenu');
    if (!burger || !menu) return;
    var close = menu.querySelector('[data-menu-close]');
    var open = function () { menu.classList.add('open'); };
    var shut = function () { menu.classList.remove('open'); };
    burger.addEventListener('click', open);
    if (close) close.addEventListener('click', shut);
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', shut); });
  }

  // "I am a" stays fixed, the role after it is typed out and deleted
  // character by character, cycling through ROLES.
  function initRoleCycler() {
    var el = document.getElementById('typed');
    if (!el) return;

    el.innerHTML = 'I am a <span class="role-text" id="roleText"></span>';
    var roleEl = document.getElementById('roleText');

    var wordIndex = 0;
    var charIndex = 0;
    var deleting = false;

    var tick = function () {
      var word = ROLES[wordIndex];

      if (!deleting) {
        charIndex++;
        roleEl.textContent = word.slice(0, charIndex);

        if (charIndex === word.length) {
          deleting = true;
          setTimeout(tick, HOLD_MS);
          return;
        }
        setTimeout(tick, TYPE_MS);
      } else {
        charIndex--;
        roleEl.textContent = word.slice(0, charIndex);

        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % ROLES.length;
          setTimeout(tick, GAP_MS);
          return;
        }
        setTimeout(tick, DELETE_MS);
      }
    };

    tick();
  }

  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var submitBtn = document.getElementById('submitBtn');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitBtn) submitBtn.textContent = 'TRANSMISSION SENT ✓';
    });
  }

  function initCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    var core = document.createElement('div');
    core.className = 'cursor-dot';
    var ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(core);
    document.body.appendChild(ring);
    document.documentElement.classList.add('cursor-hidden');

    var state = { x: innerWidth / 2, y: innerHeight / 2, rx: innerWidth / 2, ry: innerHeight / 2 };
    document.addEventListener('pointermove', function (e) {
      state.x = e.clientX; state.y = e.clientY;
      var t = e.target;
      var hot = t && t.closest && !!t.closest('a,button,input,textarea,label,[data-cursor-hot]');
      ring.classList.toggle('hot', !!hot);
    });
    document.addEventListener('pointerdown', function () { ring.classList.add('down'); });
    document.addEventListener('pointerup', function () { ring.classList.remove('down'); });

    (function loop() {
      requestAnimationFrame(loop);
      state.rx += (state.x - state.rx) * 0.16;
      state.ry += (state.y - state.ry) * 0.16;
      core.style.transform = 'translate(' + state.x + 'px,' + state.y + 'px)';
      ring.style.transform = 'translate(' + state.rx + 'px,' + state.ry + 'px)';
    })();
  }

  function bootThree(tries) {
    tries = tries || 0;
    if (!window.THREE) {
      if (tries > 120) return;
      setTimeout(function () { bootThree(tries + 1); }, 60);
      return;
    }
    var THREE = window.THREE;
    var host = document.getElementById('bg-canvas');
    if (!host) return;

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0d, 0.035);
    var camera = new THREE.PerspectiveCamera(42, host.clientWidth / host.clientHeight, 0.1, 120);
    camera.position.set(0, 0, 15);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    host.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x2a2f3b, 1.4));
    var key = new THREE.DirectionalLight(0xe6283c, 2.6); key.position.set(-6, 5, 7); scene.add(key);
    var rim = new THREE.DirectionalLight(0xf0ede4, 1.1); rim.position.set(7, -3, -5); scene.add(rim);
    var glow = new THREE.PointLight(0xe6283c, 2.2, 26); glow.position.set(2, 1, 4); scene.add(glow);

    // volumetric smoke plumes (soft billboard puffs)
    var cv = document.createElement('canvas'); cv.width = cv.height = 128;
    var cx = cv.getContext('2d');
    var g = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,0.42)');
    g.addColorStop(0.28, 'rgba(255,255,255,0.2)');
    g.addColorStop(0.62, 'rgba(255,255,255,0.06)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    cx.fillStyle = g; cx.fillRect(0, 0, 128, 128);
    var puffTex = new THREE.CanvasTexture(cv);

    var pivot = new THREE.Group();
    scene.add(pivot);
    var puffs = [];
    var PUFFS = 130;
    for (var i = 0; i < PUFFS; i++) {
      var mat = new THREE.SpriteMaterial({
        map: puffTex,
        color: 0xf0ede4,
        transparent: true,
        opacity: 0.045 + Math.random() * 0.045,
        depthWrite: false,
        blending: THREE.NormalBlending
      });
      var s = new THREE.Sprite(mat);
      var scl = 7 + Math.random() * 15;
      s.scale.set(scl, scl, 1);
      s.position.set((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 18, -4 - Math.random() * 14);
      s.material.rotation = Math.random() * Math.PI * 2;
      puffs.push({ s: s, spin: (Math.random() - 0.5) * 0.09, rise: 0.005 + Math.random() * 0.016, drift: (Math.random() - 0.5) * 0.012, phase: Math.random() * 9 });
      pivot.add(s);
    }

    // ember / sakura petal field
    var COUNT = 520;
    var geo = new THREE.BufferGeometry();
    var arr = new Float32Array(COUNT * 3);
    var vel = new Float32Array(COUNT * 3);
    var cols = new Float32Array(COUNT * 3);
    var c1 = new THREE.Color(0xe6283c), c2 = new THREE.Color(0xff8a5c), c3 = new THREE.Color(0xf0ede4);
    for (var j = 0; j < COUNT; j++) {
      arr[j * 3] = (Math.random() - 0.5) * 34;
      arr[j * 3 + 1] = (Math.random() - 0.5) * 26;
      arr[j * 3 + 2] = -6 - Math.random() * 20;
      vel[j * 3] = (Math.random() - 0.5) * 0.012;
      vel[j * 3 + 1] = -0.006 - Math.random() * 0.02;
      vel[j * 3 + 2] = (Math.random() - 0.5) * 0.006;
      var c = Math.random() < 0.62 ? c1 : (Math.random() < 0.7 ? c2 : c3);
      cols[j * 3] = c.r; cols[j * 3 + 1] = c.g; cols[j * 3 + 2] = c.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    var pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.14, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true }));
    scene.add(pts);

    window.addEventListener('resize', function () {
      if (!host.clientWidth) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    });

    var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('pointermove', function (e) {
      mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    var clock = new THREE.Clock();
    (function tick() {
      requestAnimationFrame(tick);
      var t = clock.getElapsedTime();
      var speed = SPIN_SPEED;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      pivot.rotation.y = t * 0.02 * speed + mouse.x * 0.12;
      pivot.position.x = -mouse.x * 1.4;
      pivot.position.y = -mouse.y * 0.9;
      for (var i = 0; i < puffs.length; i++) {
        var p = puffs[i];
        p.s.position.y += p.rise * speed;
        p.s.position.x += (p.drift + Math.sin(t * 0.25 + p.phase) * 0.006) * speed;
        p.s.material.rotation += p.spin * 0.01 * speed;
        if (p.s.position.y > 13) { p.s.position.y = -13; p.s.position.x = (Math.random() - 0.5) * 26; }
      }
      glow.position.x = Math.sin(t * 0.6) * 3;
      glow.intensity = 1.9 + Math.sin(t * 3.1) * 0.5;

      var pos = geo.attributes.position.array;
      for (var k = 0; k < COUNT; k++) {
        pos[k * 3] += vel[k * 3] + Math.sin(t * 0.5 + k) * 0.004;
        pos[k * 3 + 1] += vel[k * 3 + 1];
        pos[k * 3 + 2] += vel[k * 3 + 2];
        if (pos[k * 3 + 1] < -14) { pos[k * 3 + 1] = 14; pos[k * 3] = (Math.random() - 0.5) * 34; }
      }
      geo.attributes.position.needsUpdate = true;
      pts.rotation.y = t * 0.008;

      camera.position.x += (mouse.x * 1.1 - camera.position.x) * 0.03;
      camera.position.y += (-mouse.y * 0.8 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    })();
  }
})();