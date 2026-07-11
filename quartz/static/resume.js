document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('access-form');
  const formSection = document.getElementById('form-section');
  const noteSection = document.getElementById('note-section');
  const resumeSection = document.getElementById('resume-section');
  const resumeHeader = document.getElementById('resume-header');
  const resumeBody = document.getElementById('resume-body');
  const printBtn = document.getElementById('print-btn');

  printBtn.addEventListener('click', () => {
    window.print();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const roleKeyword = document.getElementById('hire-role').value.toLowerCase().trim();

    // Fire webhook silently
    fetch('https://eonwhqoenlrrmdx.m.pipedream.net', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, roleKeyword, timestamp: new Date().toISOString() })
    }).catch(err => console.error("Webhook error:", err));

    if (roleKeyword==="other") {
      noteSection.classList.remove('hidden');
    }
    else {
      await generateResume(roleKeyword);
      formSection.classList.add('hidden');
      noteSection.classList.add('hidden');
      resumeSection.classList.remove('hidden');
    }
  });

  async function generateResume(keyword) {
    try {
      const masterRes = await fetch('resume-master.json', { cache: 'no-cache' });
      const masterData = await masterRes.json();

      const mainRes = await fetch('resume-data.json', { cache: 'no-cache' });
      const mainData = await mainRes.json();

      const validKeys = masterData[keyword] || [];
      if (validKeys.length === 0) {
        alert("No mapping found for this keyword in master.json. To be updated soon.");
      }

      renderResume(mainData, validKeys);
    } catch (error) {
      console.error("Error building resume:", error);
      alert("Error loading data. Ensure you're running a local HTTP server.");
    }
  }

  function renderResume(mainData, validKeys) {
    const docModel = mainData.x_docData.x_docModel;

    // 1. Render Header
    const titleObj = docModel.title?.desc?.x_v || "Professional";
    const nameObj = mainData.user;
    const contact = docModel.contact;
    const fullName = `${contact.givenName?.x_v || ""} ${contact.familyName?.x_v || ""}`.trim() || `${nameObj.givenName} ${nameObj.familyName}`;

    let contactHtml = `<div class="resume-contact">`;
    if (contact.email?.x_v) {
      contactHtml += `<span><i class="fa-solid fa-envelope"></i> ${contact.email.x_v}</span>`;
    }
    if (contact.phone?.x_v) {
      contactHtml += `<span id="phone-container"><i class="fa-solid fa-phone"></i> 
        <span id="phone-display" data-cipher="${contact.phone.x_v}">*Encrypted*</span>
        <button type="button" class="btn-decrypt no-print" id="btn-decrypt">Decrypt</button>
      </span>`;
    }
    if (contact.linkedin?.x_v) {
      contactHtml += `<span><i class="fa-brands fa-linkedin"></i> <a href="${contact.linkedin.x_v}" target="_blank">LinkedIn</a></span>`;
    }
    if (contact.github?.x_v) {
      contactHtml += `<span><i class="fa-brands fa-github"></i> <a href="${contact.github.x_v}" target="_blank">GitHub</a></span>`;
    }
    if (contact.website?.x_v) {
      contactHtml += `<span><i class="fa-solid fa-globe"></i> <a href="${contact.website.x_v}" target="_blank">Website</a></span>`;
    }
    contactHtml += `</div>`;

    resumeHeader.innerHTML = `
      <h1>${fullName}</h1>
      <p style="font-size:1.2rem; color: var(--accent); margin-bottom: 1rem; font-weight: 600;">${titleObj}</p>
      ${contactHtml}
    `;

    // Bind decrypt button
    const btnDecrypt = document.getElementById('btn-decrypt');
    if (btnDecrypt) {
      btnDecrypt.addEventListener('click', () => {
        const password = prompt("Enter password to decrypt phone number:");
        if (!password) return;
        const cipher = document.getElementById('phone-display').getAttribute('data-cipher');
        try {
          // CryptoJS is available globally in the window, via CDN
          const bytes = CryptoJS.AES.decrypt(cipher, password);
          const plaintext = bytes.toString(CryptoJS.enc.Utf8);
          if (plaintext) {
            document.getElementById('phone-display').innerText = plaintext;
            btnDecrypt.remove();
          } else {
            alert("Incorrect password!");
          }
        } catch (e) {
          alert("Decryption failed (Likely invalid password).");
        }
      });
    }

    // 2. Render Sections
    resumeBody.innerHTML = '';

    // Explicit order, summary is handled separately if needed
    const sectionOrder = ['work', 'edu', 'skills', 'projects', 'ach', 'cert'];
    const otherSections = Object.keys(docModel).filter(k =>
      !['title', 'contact'].includes(k) && !sectionOrder.includes(k)
    );
    const finalOrder = [...sectionOrder, ...otherSections];

    const sanitizeHtml = (str) => {
      return str ? str.toString() : '';
    };

    finalOrder.forEach(sectionKey => {
      const sectionData = docModel[sectionKey];
      if (!sectionData || !sectionData.x_vs) return;

      const items = sectionData.x_vs.filter(item => validKeys.includes(item.x_key));

      if (items.length > 0) {
        // Find heading from x_docModel categories
        const headingName = sectionData.lbl?.x_v || sectionKey.toUpperCase();

        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'resume-section-block';
        sectionDiv.innerHTML = `<h2 class="resume-section-title">${headingName}</h2>`;

        if (sectionKey === 'skills' || sectionKey === 'interests') {
          const gridDiv = document.createElement('div');
          gridDiv.className = 'skills-grid';
          items.forEach(item => {
            if (item.abl?.x_v) {
              gridDiv.innerHTML += `<span class="skill-tag">${item.abl.x_v}</span>`;
            }
          });
          sectionDiv.appendChild(gridDiv);
        } else {
          items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'resume-item';

            const roleName = item.role?.x_v || item.name?.x_v || '';
            const place = item.place?.x_v || '';
            const periodStr = item.period?.x_v || '';
            const descStr = item.desc?.x_v || '';
            const loc = item.loc?.x_v || '';

            let headerHtml = `<div class="resume-item-header">
              <div class="resume-item-title">${roleName} ${place ? '— ' + place : ''}</div>
              <div class="resume-item-date">${periodStr}</div>
            </div>`;

            let htmlContent = headerHtml;

            if (loc) {
              htmlContent += `<div class="resume-item-subtitle">${loc}</div>`;
            }
            if (descStr) {
              htmlContent += `<div class="resume-item-desc">${sanitizeHtml(descStr)}</div>`;
            }

            if (item.list && Array.isArray(item.list)) {
              let ulHtml = '<ul>';
              item.list.forEach(li => {
                if (li.x_v) ulHtml += `<li>${sanitizeHtml(li.x_v)}</li>`;
              });
              ulHtml += '</ul>';
              htmlContent += `<div class="resume-item-desc">${ulHtml}</div>`;
            }

            itemDiv.innerHTML = htmlContent;
            sectionDiv.appendChild(itemDiv);
          });
        }

        resumeBody.appendChild(sectionDiv);
      }
    });
  }
});
