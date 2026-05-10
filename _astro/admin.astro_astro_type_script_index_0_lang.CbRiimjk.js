const c=window.API,p=sessionStorage.getItem("literacy_token");function h(n){["access","catalog","themes"].forEach(t=>{document.getElementById(`panel-${t}`).style.display=n===t?"block":"none",document.getElementById(`tab-${t}`).classList.toggle("active",n===t)})}window.showTab=h;async function a(n,t="GET",s=null){const e={method:t,headers:{"X-Session-Token":p}};return s&&(e.headers["Content-Type"]="application/json",e.body=JSON.stringify(s)),fetch(`${c}${n}`,e)}const v={pending:"Pending",active:"Active",rejected:"Rejected"},y={pending:"var(--text-secondary)",active:"var(--text-primary)",rejected:"var(--text-muted)"};async function d(){const t=await(await a("/admin/users")).json();if(!t.length){document.getElementById("users-list").innerHTML='<p style="color:var(--text-muted);font-size:13px;">No users yet.</p>';return}const s={pending:0,active:1,rejected:2};t.sort((e,o)=>(s[e.status]??9)-(s[o.status]??9)),document.getElementById("users-list").innerHTML=t.map(e=>`
        <div class="user-row">
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:600;">${e.username}</div>
            <div style="font-size:12px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.email}</div>
            <div style="font-size:11px;color:var(--text-muted);">${new Date(e.created_at).toLocaleDateString()}</div>
          </div>
          <div class="row-actions" style="flex-shrink:0;">
            <span class="badge" style="color:${y[e.status]||"inherit"}">${v[e.status]||e.status}</span>
            ${e.status==="pending"?`
              <button class="btn-sm approve" onclick="approveUser(${e.id})">Approve</button>
              <button class="btn-sm reject"  onclick="rejectUser(${e.id})">Reject</button>
            `:e.status==="active"?`
              <button class="btn-sm reject" onclick="deleteUser(${e.id}, '${e.username}')">Delete</button>
            `:`
              <button class="btn-sm" onclick="approveUser(${e.id})">Approve</button>
              <button class="btn-sm reject" onclick="deleteUser(${e.id}, '${e.username}')">Delete</button>
            `}
          </div>
        </div>`).join("")}async function r(){const t=await(await a("/admin/catalog")).json();if(!t.length){document.getElementById("books-list").innerHTML='<p style="color:var(--text-muted);font-size:13px;">No books yet.</p>';return}document.getElementById("books-list").innerHTML=t.map(s=>`
        <div class="book-row">
          <img src="${c}/covers/${s.slug}" onerror="this.style.display='none'"
            style="width:36px;height:54px;object-fit:cover;border-radius:4px;background:var(--bg-input);" />
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.title}</div>
            <div style="font-size:11px;color:var(--text-secondary);">${s.author}</div>
            <div style="font-size:10px;color:var(--text-muted);">${s.chapter_count} chapters · ${new Date(s.date_added).toLocaleDateString()}</div>
          </div>
          <div class="row-actions" style="flex-shrink:0;flex-wrap:wrap;gap:4px;">
            <span class="badge ${s.status}">${s.status}</span>
            <button class="btn-sm" onclick="fetchCover('${s.slug}', this)" title="Auto-fetch cover from Open Library / Google Books">↓ Cover</button>
            <label class="btn-sm" style="cursor:pointer;" title="Upload cover image from your device">
              ↑ Cover
              <input type="file" accept="image/*" style="display:none;" onchange="uploadCover('${s.slug}', this)">
            </label>
            ${s.chapter_count<=1?`<button class="btn-sm" onclick="reExtract('${s.slug}', this)" title="Re-extract chapters from embedded metadata">Chapters</button>`:""}
            <button class="btn-sm" onclick="toggleBook('${s.slug}')">${s.status==="ready"?"Hide":"Show"}</button>
          </div>
        </div>`).join("")}window.approveUser=async n=>{await a(`/admin/users/${n}/approve`,"POST"),d()};window.rejectUser=async n=>{await a(`/admin/users/${n}/reject`,"POST"),d()};window.deleteUser=async(n,t)=>{confirm(`Delete user "${t}"? This cannot be undone.`)&&(await a(`/admin/users/${n}`,"DELETE"),d())};window.toggleBook=async n=>{await a(`/admin/books/${n}/toggle`,"POST"),r()};window.uploadCover=async(n,t)=>{const s=t.files[0];if(!s)return;const e=t.parentElement,o=e.childNodes[0].textContent;e.childNodes[0].textContent="…";const i=new FormData;i.append("file",s);try{const l=await fetch(`${c}/admin/books/${n}/upload-cover`,{method:"POST",headers:{"X-Session-Token":p},body:i});if(l.ok)e.childNodes[0].textContent="✓",setTimeout(()=>r(),800);else{const u=await l.json();e.childNodes[0].textContent=o,alert(u.error||"Upload failed")}}catch{e.childNodes[0].textContent=o}};window.reExtract=async(n,t)=>{t.disabled=!0,t.textContent="…";try{const s=await a(`/admin/books/${n}/re-extract-chapters`,"POST"),e=await s.json();s.ok&&e.chapters>1?(t.textContent=`✓ ${e.chapters} ch`,setTimeout(()=>r(),1200)):(t.disabled=!1,t.textContent="Chapters",alert(e.error||`Only ${e.chapters} chapter found — no embedded chapters in file.`))}catch{t.disabled=!1,t.textContent="Chapters"}};window.fetchCover=async(n,t)=>{const s=t.textContent;t.disabled=!0,t.textContent="…";try{const e=await a(`/admin/books/${n}/fetch-cover`,"POST");if(e.ok)t.textContent="✓",setTimeout(()=>r(),800);else{const o=await e.json();t.textContent=s,t.disabled=!1,alert(o.error||"Cover fetch failed")}}catch{t.textContent=s,t.disabled=!1}};window.scanLibrary=async()=>{const n=document.getElementById("scan-btn"),t=document.getElementById("scan-result");n.disabled=!0,n.textContent="Scanning…",t.style.display="none";try{const e=await(await a("/admin/scan","POST")).json(),o=[];e.added?.length&&o.push(`✅ Added (${e.added.length}): ${e.added.map(i=>i.title).join(", ")}`),e.skipped?.length&&o.push(`⏭ Already in library (${e.skipped.length}): ${e.skipped.map(i=>i.title).join(", ")}`),e.errors?.length&&o.push(`⚠️ Errors: ${e.errors.map(i=>i.folder+" — "+i.reason).join(", ")}`),o.length||o.push("No new folders found in the library."),t.innerHTML=o.join("<br>"),t.style.display="block",e.added?.length&&r()}catch(s){t.innerHTML="❌ Scan failed: "+s.message,t.style.display="block"}n.disabled=!1,n.textContent="Scan Library"};async function m(){const t=await(await a("/config/theme")).json();document.getElementById("themes-list").innerHTML=t.available.map(s=>`
        <div class="user-row">
          <div>
            <div style="font-size:14px;font-weight:600;">${s.name}</div>
            <div style="font-size:12px;color:var(--text-secondary);">${s.description}</div>
          </div>
          <div class="row-actions">
            ${t.active===s.id?'<span class="badge ready">Active</span>':`<button class="btn-sm" onclick="setTheme('${s.id}')">Apply</button>`}
          </div>
        </div>`).join("")}window.setTheme=async n=>{await a("/config/theme","POST",{theme:n}),document.getElementById("theme-css").href=`/themes/${n}.css`,m()};function f(){document.getElementById("users-list")&&(d(),r(),m())}document.addEventListener("astro:page-load",f);
