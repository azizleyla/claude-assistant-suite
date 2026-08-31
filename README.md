# Claude Next.js Playground — Tapşırıq Köməkçisi & Sənəd Köməkçisi

Next.js (App Router) üzərində qurulmuş, **Claude API** ilə işləyən iki ayrı tətbiq nümunəsi:

| Tətbiq | Yol | Nə göstərir |
|--------|-----|-------------|
| 🛠️ **Tapşırıq Köməkçisi** | `/` | **Tool Use** (function calling) — Claude təbii dildən todo əlavə edir, göstərir və silir |
| 📄 **Sənəd Köməkçisi** | `/document` | **RAG** (Retrieval-Augmented Generation) — PDF yüklə, məzmunu haqqında sual ver |

Hər iki tətbiq arasında yuxarıdakı tab (switcher) ilə keçid edilir.

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

> Əlavə nümunə: `app/api/weather/route.ts` — eyni tool-use nümunəsi, amma **hava** aləti (`get_weather`, Open-Meteo API) ilə.

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
├─ page.tsx              # 🛠️ Tapşırıq Köməkçisi (UI)
├─ document/page.tsx     # 📄 Sənəd Köməkçisi (UI)
├─ components/
│  └─ AppSwitcher.tsx    # İki tətbiq arası tab keçidi
└─ api/
   ├─ todo/route.ts      # Tool Use — todo alətləri
   ├─ weather/route.ts   # Tool Use — hava aləti (əlavə nümunə)
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
npm run lint    # ESLint
```

---

## Lisenziya

Təhsil/nümunə məqsədli layihə.
