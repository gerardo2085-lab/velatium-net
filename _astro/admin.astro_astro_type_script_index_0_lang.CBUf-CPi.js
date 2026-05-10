const l=window.API,p=sessionStorage.getItem("literacy_token");function y(t){["access","catalog","themes"].forEach(n=>{document.getElementById(`panel-${n}`).style.display=t===n?"block":"none",document.getElementById(`tab-${n}`).classList.toggle("active",t===n)})}window.showTab=y;async function o(t,n="GET",e=null){const s={method:n,headers:{"X-Session-Token":p}};return e&&(s.headers["Content-Type"]="application/json",s.body=JSON.stringify(e)),fetch(`${l}${t}`,s)}async function d(){const e=(await(await o("/admin/users")).json()).filter(s=>s.status==="pending");if(!e.length){document.getElementById("users-list").innerHTML='<p style="color:var(--text-muted);font-size:13px;">No pending requests.</p>';return}document.getElementById("users-list").innerHTML=e.map(s=>`
        <div class="user-row">
          <div>
            <div style="font-size:14px;font-weight:600;">${s.username}</div>
            <div style="font-size:12px;color:var(--text-secondary);">${s.email}</div>
            <div style="font-size:11px;color:var(--text-muted);">${new Date(s.created_at).toLocaleDateString()}</div>
          </div>
          <div class="row-actions">
            <button class="btn-sm approve" onclick="approveUser(${s.id})">Approve</button>
            <button class="btn-sm reject"  onclick="rejectUser(${s.id})">Reject</button>
          </div>
        </div>`).join("")}async function r(){const n=await(await o("/admin/catalog")).json();if(!n.length){document.getElementById("books-list").innerHTML='<p style="color:var(--text-muted);font-size:13px;">No books yet.</p>';return}document.getElementById("books-list").innerHTML=n.map(e=>`
        <div class="book-row">
          <img src="${l}/covers/${e.slug}" onerror="this.style.display='none'"
            style="width:36px;height:54px;object-fit:cover;border-radius:4px;background:var(--bg-input);" />
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${e.title}</div>
            <div style="font-size:11px;color:var(--text-secondary);">${e.author}</div>
            <div style="font-size:10px;color:var(--text-muted);">${e.chapter_count} chapters · ${new Date(e.date_added).toLocaleDateString()}</div>
          </div>
          <div class="row-actions" style="flex-shrink:0;">
            <span class="badge ${e.status}">${e.status}</span>
            <button class="btn-sm" onclick="toggleBook('${e.slug}')">${e.status==="ready"?"Hide":"Show"}</button>
          </div>
        </div>`).join("")}window.approveUser=async t=>{await o(`/admin/users/${t}/approve`,"POST"),d()};window.rejectUser=async t=>{await o(`/admin/users/${t}/reject`,"POST"),d()};window.toggleBook=async t=>{await o(`/admin/books/${t}/toggle`,"POST"),r()};window.scanLibrary=async()=>{const t=document.getElementById("scan-btn"),n=document.getElementById("scan-result");t.disabled=!0,t.textContent="Scanning…",n.style.display="none";try{const s=await(await o("/admin/scan","POST")).json(),i=[];s.added?.length&&i.push(`✅ Added (${s.added.length}): ${s.added.map(a=>a.title).join(", ")}`),s.skipped?.length&&i.push(`⏭ Already in library (${s.skipped.length}): ${s.skipped.map(a=>a.title).join(", ")}`),s.errors?.length&&i.push(`⚠️ Errors: ${s.errors.map(a=>a.folder+" — "+a.reason).join(", ")}`),i.length||i.push("No new folders found in the library."),n.innerHTML=i.join("<br>"),n.style.display="block",s.added?.length&&r()}catch(e){n.innerHTML="❌ Scan failed: "+e.message,n.style.display="block"}t.disabled=!1,t.textContent="Scan Library"};async function c(){const n=await(await o("/config/theme")).json();document.getElementById("themes-list").innerHTML=n.available.map(e=>`
        <div class="user-row">
          <div>
            <div style="font-size:14px;font-weight:600;">${e.name}</div>
            <div style="font-size:12px;color:var(--text-secondary);">${e.description}</div>
          </div>
          <div class="row-actions">
            ${n.active===e.id?'<span class="badge ready">Active</span>':`<button class="btn-sm" onclick="setTheme('${e.id}')">Apply</button>`}
          </div>
        </div>`).join("")}window.setTheme=async t=>{await o("/config/theme","POST",{theme:t}),document.getElementById("theme-css").href=`/themes/${t}.css`,c()};d();r();c();
