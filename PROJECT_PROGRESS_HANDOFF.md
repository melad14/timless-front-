# Timeless — ملخص التنفيذ (Handoff لمن يكمل)

هذا الملف يلخص ما تم تنفيذه على فرونت إند مشروع **Timeless** حتى تاريخ إنشائه، حتى يتمكن أي مطور من المتابعة بسرعة.

---

## 1. مرجع الباك اند

- توثيق الـ API: `FRONTEND_API.md` (المصدر الأدق للسلوك الحالي).
- Postman: `Timeless-API.postman_collection.json`.
- ملاحظة إضافية: `PROJECT_DOCS.md` قد يحتوي أمثلة أقدم (مثلاً تشفير من الفرونت للكبسولة) — **الاعتماد في التكامل على `FRONTEND_API.md`** (المحتوى يُرسل plain text والخادم يشفّر).

**Base URL الافتراضي في الكود:**  
`https://timeless-lemon.vercel.app/api/v1`  
يمكن تغييره بـ: `REACT_APP_API_BASE_URL` في `.env`.

---

## 2. طبقة الخدمات (API)

| الملف | الوظيفة |
|--------|---------|
| `src/services/api.js` | `fetch` موحّد، `Authorization: Bearer`، معالجة أخطاء، مسح الجلسة عند `401`. |
| `src/services/authService.js` | `login`, `signup` (بدون auto-login بعد التسجيل — يمسح الجلسة ويُفترض الدخول يدويًا)، `logout`, `fetchMe`, `isAuthenticated` (مع التحقق من صلاحية JWT وانتهاء `exp`). |
| `src/services/capsuleService.js` | إنشاء كبسولة زمنية `POST /time-capsules` مع `title` مُشتق من المحتوى. |
| `src/services/conversationService.js` | قائمة/تفاصيل/إنشاء محادثات. |
| `src/services/messageService.js` | رسائل المحادثة، المفضلة، إرسال/تعديل/حذف، تبديل مفضلة، قراءة. |

**تخزين الجلسة:** `localStorage` — المفاتيح `access_token` و `auth_user` (انظر `api.js`).

---

## 3. التوجيه والمصادقة (`src/App.js`)

- **ProtectedRoute:** الصفحات المحمية تتطلب `isAuthenticated()`؛ وإلا توجيه إلى `/login`.
- **InverseProtectedRoute:** `/login` و `/register` — إذا كان المستخدم مسجّل دخول يُوجَّه إلى `/`.
- مسار catch-all `*` → `/`.

**صفحات محمية حاليًا:** `/`, `/about`, `/messages`, `/howitworks`, `/profile`, `/complaints`.  
**عكسية:** `/login`, `/register`.

---

## 4. الواجهات المنفذة

### 4.1 تسجيل الدخول — `src/Components/Login/`

- UI قريب من التصميم (خلفية، بطاقة زجاجية، حقول، زر).
- ربط: `POST /auth/login` عبر `authService.login`.
- بعد تسجيل ناجح من التسجيل: رسالة نجاح عبر `location.state.registered`.

### 4.2 التسجيل — `src/Components/Register/`

- فورم: username، email، phone_number، password، موافقة الشروط.
- ربط: `POST /auth/signup` **بدون** حفظ توكن تلقائيًا بعد النجاح؛ مسح الجلسة ثم توجيه إلى `/login`.

### 4.3 الرئيسية (كتابة رسالة / كبسولة) — `src/Components/Home/`

- تخطيط حسب التصميم: نموذج يسار + اقتباس وصورة يمين (`Home.css`, صورة `src/assets/images/Home.png`).
- حفظ الرسالة: `createCapsule` → `POST /time-capsules` مع `content_type: "text"` و `open_date` من حقل التاريخ.
- حقول إضافية في الواجهة (مثل رقم الموبايل، checkboxes تذكير/إخفاء) قد لا تُرسل كلها للـ API حاليًا إن لم يكن لها حقول مطابقة في الـ backend — المراجعة مع الـ API عند التوسع.

### 4.4 شريط التنقل — `src/Components/Navbar/`

- لوجو + روابط (Home, Message Box, About, Complaints).
- إخفاء الـ Navbar على `/login` و `/register`.
- عرض اسم المستخدم من `getStoredUser()`.
- **زر Logout:** يستدعي `logout()` ثم `navigate("/login", { replace: true })`.

### 4.5 التخطيط — `src/Components/Layout/Layout.jsx`

- إزالة `container` حول `Outlet` لمنع ضيق عرض الصفحات full-width.

### 4.6 صندوق الرسائل — `src/Components/Messages/`

- تخطيط ثلاثي: شريط جانبي (New Message + Inbox / Sent / Favorite)، قائمة وسط، تفاصيل يمين.
- **Inbox:** `GET /conversations` + جلب رسائل المحادثات للمعاينة/التفاصيل.
- **Sent:** تجميع رسائل المرسل الحالي عبر المحادثات (عدة طلبات).
- **Favorites:** `GET /messages/user/favorites`.
- **New Message (مودال):** `POST /conversations` ثم `POST /messages`.
- **Reply / Edit / Delete / Favorite:** حسب الـ endpoints في `messageService`.
- Responsive: على الشاشات الصغيرة قائمة ↔ تفاصيل مع زر رجوع.

---

## 5. اعتماديات الواجهة

من `package.json` (أهمها): React 19، `react-router-dom` 7، Bootstrap 5، Font Awesome، Axios (مثبت؛ جزء من الخدمات يستخدم `fetch` مباشرة في `api.js`).

---

## 6. أوامر مفيدة للمتابعة

```bash
npm install
npm start          # تطوير
npm run build      # تحقق من البناء
```

---

## 7. اقتراحات للخطوات التالية (للمكمل)

1. **توحيد HTTP client:** إما الاعتماد على `axios` في كل الخدمات أو الإبقاء على `fetch` في `api.js` فقط.
2. **AuthContext:** حالة مستخدم مركزية + `fetchMe` عند التشغيل لتزامن مع السيرفر.
3. **صفحة “New Message” كاملة:** إن وُجد تصميم منفصل أو بحث مستخدمين من الـ API.
4. **Message Box:** تحسين أداء Sent (تقليل الطلبات إن وُجد endpoint مجمع)، وعرض أسماء المرسلين من `GET /users/{id}` إن لزم.
5. **الكبسولات:** شاشات قائمة الكبسولات المعلقة/المفتوحة وربطها بـ `GET /time-capsules/pending` و `/opened` حسب المنتج.
6. **`.env.example`:** توثيق `REACT_APP_API_BASE_URL` للفريق.

---

## 8. ملفات رئيسية للمراجعة السريعة

```
src/App.js
src/services/api.js
src/services/authService.js
src/services/capsuleService.js
src/services/conversationService.js
src/services/messageService.js
src/Components/Layout/Layout.jsx
src/Components/Navbar/Navbar.jsx + Navbar.css
src/Components/Login/Login.jsx + Login.css
src/Components/Register/Register.jsx + Register.css
src/Components/Home/Home.jsx + Home.css
src/Components/Messages/Messages.jsx + Messages.css
```

---

*تم إنشاء هذا الملف بناءً على طلب صاحب المشروع لتسليم العمل لزميل يكمل التطوير.*
