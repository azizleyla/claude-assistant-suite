# Claude Next.js Playground — Tapşırıq Köməkçisi & Sənəd Köməkçisi

Next.js (App Router) üzərində qurulmuş, **Claude API** ilə işləyən üç ayrı tətbiq nümunəsi:

| Tətbiq | Yol | Nə göstərir |
|--------|-----|-------------|
| 🏠 **Giriş (Landing)** | `/` | Üç tətbiqi təqdim edən başlanğıc səhifəsi |
| 🛠️ **Tapşırıq Köməkçisi** | `/tasks` | **Tool Use** (function calling) — Claude təbii dildən todo əlavə edir, göstərir və silir |
| 📄 **Sənəd Köməkçisi** | `/document` | **RAG** (Retrieval-Augmented Generation) — PDF yüklə, məzmunu haqqında sual ver |
| ⛅ **Hava Köməkçisi** | `/weather` | **Tool Use** — Claude `get_weather` alətini çağırıb real hava məlumatı gətirir |

Tətbiqlər arasında yuxarıdakı tab (switcher) ilə keçid edilir.

---

## Texnologiyalar

- [Next.js 16](https://nextjs.org) — App Router, API Routes
- [React 19](https://react.dev)
- [Tailwind CSS 4](https://tailwindcss.com)
- [Claude API](https://docs.anthropic.com) (`claude-sonnet-4-6`) — söhbət + tool use
- [Voyage AI](https://voyageai.com) (`voyage-3-large`) — RAG üçün embedding
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) — PDF-dən mətn çıxarma

---

## Quraşdırma

1. Asılılıqları yüklə:

   ```bash
   npm install
   ```

2. `.env.example`-i `.env.local` kimi kopyala və açarları doldur:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   ANTHROPIC_API_KEY=sk-ant-...
   ANTHROPIC_API_URL=https://api.anthropic.com/v1/messages
   VOYAGE_API_KEY=pa-...
   ```

   - `ANTHROPIC_API_KEY` — https://console.anthropic.com
   - `VOYAGE_API_KEY` — https://dashboard.voyageai.com (yalnız Sənəd Köməkçisi üçün lazımdır)

3. Dev serveri işə sal:

   ```bash
   npm run dev
   ```

   Brauzerdə [http://localhost:3000](http://localhost:3000) aç.

---

## 🛠️ Tapşırıq Köməkçisi (Tool Use)

Claude-a təbii dildə yazırsan, o isə lazım olan **aləti** özü seçib çağırır.

**Nümunə:** *"Alış-veriş etməyi todo-ya əlavə et"* → Claude `add_todo` alətini çağırır.

Mövcud alətlər (`app/api/todo/route.ts`):

- `add_todo` — yeni tapşırıq əlavə edir
- `list_todos` — bütün tapşırıqları göstərir
- `delete_todo` — ID-yə görə tapşırığı silir

**İş axını:**

```
İstifadəçi mesajı
   → Claude (tools ilə)
   → stop_reason: "tool_use" olarsa → uyğun funksiya işləyir
   → nəticə (tool_result) Claude-a qaytarılır
   → Claude yekun cavabı yazır
```

---

## ⛅ Hava Köməkçisi (Tool Use)

Şəhər adı yazırsan, Claude həmin şəhərin koordinatını özü hesablayıb `get_weather` alətini çağırır, alət isə [Open-Meteo API](https://open-meteo.com)-dən real havanı gətirir.

- Endpoint: `app/api/weather/route.ts` (`get_weather` aləti)
- UI (`app/weather/page.tsx`): şəhər axtarışı → cavab mətninə görə seçilən hava ikonu ilə nəticə kartı

---

## 📄 Sənəd Köməkçisi (RAG)

PDF yüklənir, mətn hissələrə bölünür və embedding-ə çevrilir. Sual veriləndə ən uyğun hissələr tapılıb Claude-a kontekst kimi verilir.

**İş axını:**

```
1. Upload (/api/upload)
   PDF → mətn (pdf-parse) → chunk-lara böl → embedding (Voyage) → yaddaşda saxla

2. Sual (/api/ask)
   Sual → embedding → cosine similarity ilə ən uyğun 3 chunk → Claude-a kontekst → cavab
```

Köməkçi funksiyalar `lib/embeddings.ts`-dədir: `chunkText`, `getEmbeddings`, `cosineSimilarity`.

> **Qeyd:** Yüklənmiş sənəd `lib/store.ts`-də **yaddaşda (in-memory)** saxlanılır. Bu, `npm run dev`-də işləyir, amma:
> - Server yenidən başlayanda sənəd itir — yenidən yükləmək lazımdır.
> - Production/serverless (məs. Vercel) mühitdə hər sorğu ayrı proses ola bildiyi üçün real vektor bazası (Pinecone, Supabase pgvector və s.) lazımdır.

---

## Layihə strukturu

```
app/
├─ page.tsx              # 🏠 Giriş (landing) — 3 tətbiq kartı
├─ tasks/page.tsx        # 🛠️ Tapşırıq Köməkçisi (UI)
├─ document/page.tsx     # 📄 Sənəd Köməkçisi (UI)
├─ weather/page.tsx      # ⛅ Hava Köməkçisi (UI)
├─ components/
│  └─ AppSwitcher.tsx    # tətbiqlər arası tab keçidi
└─ api/
   ├─ todo/route.ts      # Tool Use — todo alətləri
   ├─ weather/route.ts   # Tool Use — hava aləti (get_weather)
   ├─ upload/route.ts    # RAG — PDF yüklə & embedding
   └─ ask/route.ts       # RAG — sual üzrə axtarış & cavab
lib/
├─ embeddings.ts         # chunkText, getEmbeddings, cosineSimilarity
├─ store.ts              # in-memory chunk yaddaşı
└─ types.ts              # ortaq tiplər (ChatMessage)
```

---

## Skriptlər

```bash
npm run dev     # dev server (localhost:3000)
npm run build   # production build
npm run start   # production serveri
```

> **Qeyd:** `eslint` və `eslint-config-next` dev asılılıqları müvəqqəti olaraq çıxarılıb, çünki onların bir transitive asılılığının xarab versiya metadata-sı `npm install`-ı (o cümlədən Vercel-də) çökdürürdü. Upstream düzələndə geri qaytarıla bilər.

---

## Lisenziya

Təhsil/nümunə məqsədli layihə.
