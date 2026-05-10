const c=window.API,p=sessionStorage.getItem("literacy_token");function v(n){["access","catalog","themes"].forEach(t=>{document.getElementById(`panel-${t}`).style.display=n===t?"block":"none",document.getElementById(`tab-${t}`).classList.toggle("active",n===t)})}window.showTab=v;async function i(n,t="GET",s=null){const e={method:t,headers:{"X-Session-Token":p}};return s&&(e.headers["Content-Type"]="application/json",e.body=JSON.stringify(s)),fetch(`${c}${n}`,e)}const u={pending:"Pending",active:"Active",rejected:"Rejected"},m={pending:"var(--text-secondary)",active:"var(--text-primary)",rejected:"var(--text-muted)"};async function r(){const t=await(await i("/admin/users")).json();if(!t.length){document.getElementById("users-list").innerHTML='<p style="color:var(--text-muted);font-size:13px;">No users yet.</p>';return}const s={pending:0,active:1,rejected:2};t.sort((e,o)=>(s[e.status]??9)-(s[o.status]??9)),document.getElementById("users-list").innerHTML=t.map(e=>`
        <div class="user-row">
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:600;">${e.username}</div>
            <div style="font-size:12px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.email}</div>
            <div style="font-size:11px;color:var(--text-muted);">${new Date(e.created_at).toLocaleDateString()}</div>
          </div>
          <div class="row-actions" style="flex-shrink:0;">
            <span class="badge" style="color:${m[e.status]||"inherit"}">${u[e.status]||e.status}</span>
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
        </div>`).join("")}async function d(){const t=await(await i("/admin/catalog")).json();if(!t.length){document.getElementById("books-list").innerHTML='<p style="color:var(--text-muted);font-size:13px;">No books yet.</p>';return}document.getElementById("books-list").innerHTML=t.map(s=>`
        <div class="book-row">
          <img src="${c}/covers/${s.slug}" onerror="this.style.display='none'"
            style="width:36px;height:54px;object-fit:cover;border-radius:4px;background:var(--bg-input);" />
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.title}</div>
            <div style="font-size:11px;color:var(--text-secondary);">${s.author}</div>
            <div style="font-size:10px;color:var(--text-muted);">${s.chapter_count} chapters · ${new Date(s.date_added).toLocaleDateString()}</div>
          </div>
          <div class="row-actions" style="flex-shrink:0;">
            <span class="badge ${s.status}">${s.status}</span>
            <button class="btn-sm" onclick="fetchCover('${s.slug}', this)" title="Auto-fetch cover from Open Library / Google Books">Cover</button>
            <button class="btn-sm" onclick="toggleBook('${s.slug}')">${s.status==="ready"?"Hide":"Show"}</button>
          </div>
        </div>`).join("")}window.approveUser=async n=>{await i(`/admin/users/${n}/approve`,"POST"),r()};window.rejectUser=async n=>{await i(`/admin/users/${n}/reject`,"POST"),r()};window.deleteUser=async(n,t)=>{confirm(`Delete user "${t}"? This cannot be undone.`)&&(await i(`/admin/users/${n}`,"DELETE"),r())};window.toggleBook=async n=>{await i(`/admin/books/${n}/toggle`,"POST"),d()};window.fetchCover=async(n,t)=>{const s=t.textContent;t.disabled=!0,t.textContent="…";try{const e=await i(`/admin/books/${n}/fetch-cover`,"POST");if(e.ok)t.textContent="✓",setTimeout(()=>d(),800);else{const o=await e.json();t.textContent=s,t.disabled=!1,alert(o.error||"Cover fetch failed")}}catch{t.textContent=s,t.disabled=!1}};window.scanLibrary=async()=>{const n=document.getElementById("scan-btn"),t=document.getElementById("scan-result");n.disabled=!0,n.textContent="Scanning…",t.style.display="none";try{const e=await(await i("/admin/scan","POST")).json(),o=[];e.added?.length&&o.push(`✅ Added (${e.added.length}): ${e.added.map(a=>a.title).join(", ")}`),e.skipped?.length&&o.push(`⏭ Already in library (${e.skipped.length}): ${e.skipped.map(a=>a.title).join(", ")}`),e.errors?.length&&o.push(`⚠️ Errors: ${e.errors.map(a=>a.folder+" — "+a.reason).join(", ")}`),o.length||o.push("No new folders found in the library."),t.innerHTML=o.join("<br>"),t.style.display="block",e.added?.length&&d()}catch(s){t.innerHTML="❌ Scan failed: "+s.message,t.style.display="block"}n.disabled=!1,n.textContent="Scan Library"};async function l(){const t=await(await i("/config/theme")).json();document.getElementById("themes-list").innerHTML=t.available.map(s=>`
        <div class="user-row">
          <div>
            <div style="font-size:14px;font-weight:600;">${s.name}</div>
            <div style="font-size:12px;color:var(--text-secondary);">${s.description}</div>
          </div>
          <div class="row-actions">
            ${t.active===s.id?'<span class="badge ready">Active</span>':`<button class="btn-sm" onclick="setTheme('${s.id}')">Apply</button>`}
          </div>
        </div>`).join("")}window.setTheme=async n=>{await i("/config/theme","POST",{theme:n}),document.getElementById("theme-css").href=`/themes/${n}.css`,l()};r();d();l();
