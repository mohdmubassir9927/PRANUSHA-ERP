# PRANUSHA ERP Starter

यह मोबाइल और कंप्यूटर के लिए responsive starter web app है।

## Supabase
1. Supabase project URL और publishable/anon key लें।
2. `.env.example` की कॉपी `.env` नाम से बनाएं।
3. `.env` में `VITE_SUPABASE_URL` और `VITE_SUPABASE_ANON_KEY` भरें।
4. `database/setup.sql` को Supabase SQL Editor में चलाएं।

**कभी भी service_role/secret key को frontend या GitHub में न डालें।**

## Run / Build
Node.js 20+ वाले कंप्यूटर पर:
```bash
npm install
npm run dev
npm run build
```
Hosting के लिए GitHub repository में source upload करें। Cloudflare Pages में framework preset Vite, build command `npm run build`, output directory `dist` रखें। Environment variables भी सेट करें।

## अभी उपलब्ध
- Supabase email/password login
- Dashboard पर billing, expense और indicative balance
- Site transaction entry
- RA Bill / Final Bill entry
- Basic register

## अभी शामिल नहीं
Material stock, detailed labour attendance/payroll, contractor ledger, cash/bank reconciliation, GST returns, e-Invoice IRN integration, approval queue और complete audited P&L. Live e-Invoice के लिए authorized GSP/API integration और credentials आवश्यक हैं।
