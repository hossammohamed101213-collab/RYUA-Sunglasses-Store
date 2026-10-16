(() => {
  const SUPABASE_URL = 'https://udpxlnrcyguhjvawwwut.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_HlroL0YduGjTb07-Esz7rA_UynIK-21';
  const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-order`;
  const namesToSlugs = { 'آدم': 'mada', 'زين': 'zain', 'راكان': 'rakan' };
  let clientPromise;

  const loadClient = async () => {
    if (!clientPromise) clientPromise = import('https://esm.sh/@supabase/supabase-js@2').then(({ createClient }) => createClient(SUPABASE_URL, SUPABASE_KEY));
    const client = await clientPromise;
    const { data } = await client.auth.getSession();
    if (!data.session) {
      const { error } = await client.auth.signInAnonymously();
      if (error) throw error;
    }
    return client;
  };

  const styles = document.createElement('style');
  styles.textContent = '.ryua-order-modal{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:18px;background:#06111dd9}.ryua-order-card{width:min(520px,100%);padding:26px;border:1px solid #67dce766;border-radius:24px;background:#0c1b2a;color:#f7fbff;box-shadow:0 24px 90px #000b}.ryua-order-card h2{margin:0 0 8px;font-size:24px}.ryua-order-card p{color:#b8cbd6;line-height:1.7}.ryua-order-form{display:grid;gap:12px}.ryua-order-form label{display:grid;gap:6px;font-size:13px;font-weight:700}.ryua-order-form input,.ryua-order-form textarea{padding:12px;border:1px solid #c7e8ed38;border-radius:12px;background:#081522;color:#fff;font:inherit}.ryua-order-actions{display:flex;gap:10px;margin-top:8px}.ryua-order-actions button{flex:1;padding:13px;border:0;border-radius:999px;font:inherit;font-weight:700;cursor:pointer}.ryua-order-submit{background:linear-gradient(105deg,#55dce8,#739ee8);color:#071622}.ryua-order-cancel{background:#ffffff14;color:#eaf5fa}.ryua-order-status{min-height:22px;color:#ffcf9f;font-size:12px}';
  document.head.append(styles);

  function getItems() {
    const specs = (() => { try { return JSON.parse(localStorage.getItem('ryua-order-specs-v1') || '{}'); } catch { return {}; } })();
    return [...document.querySelectorAll('.bag-line h3')].map((heading) => {
      const name = heading.textContent.trim();
      return { slug: namesToSlugs[name], quantity: 1, color: specs[name]?.color || 'غير محدد' };
    }).filter((item) => item.slug);
  }

  function openOrderForm() {
    if (document.querySelector('.ryua-order-modal')) return;
    const modal = document.createElement('div');
    modal.className = 'ryua-order-modal';
    modal.innerHTML = '<section class="ryua-order-card" role="dialog" aria-modal="true" aria-labelledby="ryuaOrderTitle"><h2 id="ryuaOrderTitle">تأكيد طلب رويا</h2><p>أدخل بيانات التواصل ليتم تسجيل الطلب فعليًا، ثم نكمل التأكيد معك عبر واتساب.</p><form class="ryua-order-form"><label>الاسم<input name="name" required minlength="2" autocomplete="name"></label><label>رقم واتساب<input name="phone" required inputmode="tel" autocomplete="tel" placeholder="+971…"></label><label>منطقة التوصيل<input name="area" maxlength="120" autocomplete="address-level2"></label><label>ملاحظات إضافية<textarea name="notes" maxlength="500" rows="3"></textarea></label><div class="ryua-order-status" aria-live="polite"></div><div class="ryua-order-actions"><button type="button" class="ryua-order-cancel">إلغاء</button><button class="ryua-order-submit">تسجيل الطلب</button></div></form></section>';
    document.body.append(modal);
    const form = modal.querySelector('form');
    modal.querySelector('.ryua-order-cancel').onclick = () => modal.remove();
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = modal.querySelector('.ryua-order-status');
      const submit = modal.querySelector('.ryua-order-submit');
      const items = getItems();
      if (!items.length) { status.textContent = 'السلة فارغة.'; return; }
      submit.disabled = true; status.textContent = 'جارٍ تسجيل الطلب…';
      try {
        const client = await loadClient();
        const { data: sessionData } = await client.auth.getSession();
        const formData = new FormData(form);
        const response = await fetch(FUNCTION_URL, { method: 'POST', headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${sessionData.session.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ customer: { name: formData.get('name'), phone: formData.get('phone'), area: formData.get('area'), notes: formData.get('notes') }, items }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'تعذر تسجيل الطلب');
        status.style.color = '#8ff3d5'; status.textContent = `تم تسجيل الطلب ${result.order.order_number}. سيتواصل معك فريق رويا للتأكيد.`;
        setTimeout(() => modal.remove(), 2200);
      } catch (error) {
        console.error(error); status.textContent = 'تعذر التسجيل الآن. استخدم واتساب لإكمال الطلب مباشرة.'; submit.disabled = false;
      }
    });
  }

  window.addEventListener('DOMContentLoaded', () => {
    const checkout = document.getElementById('bagCheckout');
    if (!checkout) return;
    checkout.addEventListener('click', (event) => { if (getItems().length) { event.preventDefault(); openOrderForm(); } }, true);
  });
})();
