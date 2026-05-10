const c=window.API,p=sessionStorage.getItem("literacy_token");function v(s){["access","catalog","themes"].forEach(t=>{document.getElementById(`panel-${t}`).style.display=s===t?"block":"none",document.getElementById(`tab-${t}`).classList.toggle("active",s===t)})}window.showTab=v;async function o(s,t="GET",n=null){const e={method:t,headers:{"X-Session-Token":p}};return n&&(e.headers["Content-Type"]="application/json",e.body=JSON.stringify(n)),fetch(`${c}${s}`,e)}const m={pending:"Pending",active:"Active",rejected:"Rejected"},u={pending:"var(--text-secondary)",active:"var(--text-primary)",rejected:"var(--text-muted)"};async function d(){const t=await(await o("/admin/users")).json();if(!t.length){document.getElementById("users-list").innerHTML='<p style="color:var(--text-muted);font-size:13px;">No users yet.</p>';return}const n={pending:0,active:1,rejected:2};t.sort((e,i)=>(n[e.status]??9)-(n[i.status]??9)),document.getElementById("users-list").innerHTML=t.map(e=>`
        <div class="user-row">
          <div style="flex:1;min-width:0;">
            <div style="font-size:14px;font-weight:600;">${e.username}</div>
            <div style="font-size:12px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.email}</div>
            <div style="font-size:11px;color:var(--text-muted);">${new Date(e.created_at).toLocaleDateString()}</div>
          </div>
          <div class="row-actions" style="flex-shrink:0;">
            <span class="badge" style="color:${u[e.status]||"inherit"}">${m[e.status]||e.status}</span>
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
        </div>`).join("")}async function r(){const t=await(await o("/admin/catalog")).json();if(!t.length){document.getElementById("books-list").innerHTML='<p style="color:var(--text-muted);font-size:13px;">No books yet.</p>';return}document.getElementById("books-list").innerHTML=t.map(n=>`
        <div class="book-row">
          <img src="${c}/covers/${n.slug}" onerror="this.style.display='none'"
            style="width:36px;height:54px;object-fit:cover;border-radius:4px;background:var(--bg-input);" />
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${n.title}</div>
            <div style="font-size:11px;color:var(--text-secondary);">${n.author}</div>
            <div style="font-size:10px;color:var(--text-muted);">${n.chapter_count} chapters · ${new Date(n.date_added).toLocaleDateString()}</div>
          </div>
          <div class="row-actions" style="flex-shrink:0;">
            <span class="badge ${n.status}">${n.status}</span>
            <button class="btn-sm" onclick="toggleBook('${n.slug}')">${n.status==="ready"?"Hide":"Show"}</button>
          </div>
        </div>`).join("")}window.approveUser=async s=>{await o(`/admin/users/${s}/approve`,"POST"),d()};window.rejectUser=async s=>{await o(`/admin/users/${s}/reject`,"POST"),d()};window.deleteUser=async(s,t)=>{confirm(`Delete user "${t}"? This cannot be undone.`)&&(await o(`/admin/users/${s}`,"DELETE"),d())};window.toggleBook=async s=>{await o(`/admin/books/${s}/toggle`,"POST"),r()};window.scanLibrary=async()=>{const s=document.getElementById("scan-btn"),t=document.getElementById("scan-result");s.disabled=!0,s.textContent="Scanning…",t.style.display="none";try{const e=await(await o("/admin/scan","POST")).json(),i=[];e.added?.length&&i.push(`✅ Added (${e.added.length}): ${e.added.map(a=>a.title).join(", ")}`),e.skipped?.length&&i.push(`⏭ Already in library (${e.skipped.length}): ${e.skipped.map(a=>a.title).join(", ")}`),e.errors?.length&&i.push(`⚠️ Errors: ${e.errors.map(a=>a.folder+" — "+a.reason).join(", ")}`),i.length||i.push("No new folders found in the library."),t.innerHTML=i.join("<br>"),t.style.display="block",e.added?.length&&r()}catch(n){t.innerHTML="❌ Scan failed: "+n.message,t.style.display="block"}s.disabled=!1,s.textContent="Scan Library"};async function l(){const t=await(await o("/config/theme")).json();document.getElementById("themes-list").innerHTML=t.available.map(n=>`
        <div class="user-row">
          <div>
            <div style="font-size:14px;font-weight:600;">${n.name}</div>
            <div style="font-size:12px;color:var(--text-secondary);">${n.description}</div>
          </div>
          <div class="row-actions">
            ${t.active===n.id?'<span class="badge ready">Active</span>':`<button class="btn-sm" onclick="setTheme('${n.id}')">Apply</button>`}
          </div>
        </div>`).join("")}window.setTheme=async s=>{await o("/config/theme","POST",{theme:s}),document.getElementById("theme-css").href=`/themes/${s}.css`,l()};d();r();l();
