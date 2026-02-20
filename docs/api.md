# API dokumentacio (REST szemlelet)

Megjegyzes: a projekt valojaban Next.js Server Actions-t hasznal, nincs kulon REST route handler.
Ez a dokumentum egy REST-szeru, endpoint-alapu szemleletet ir le, hogy atlathato legyen.

Base URL (pelda):

- http://localhost:3000

Auth:

- Session cookie: `session`

---

## Auth

### POST /api/auth/register

Leiras: Uj felhasznalo regisztralasa es session letrehozasa.

Request body (JSON):

```json
{
  "username": "anna",
  "email": "anna@example.com",
  "password": "demo1234",
  "confirmPassword": "demo1234"
}
```

Response (200):

```json
{ "ok": true, "message": "Registration complete. Session created." }
```

Hibak:

- 400: invalid input
- 409: email mar foglalt
- 409: username mar foglalt

---

### POST /api/auth/login

Leiras: Bejelentkezes es session letrehozasa.

Request body (JSON):

```json
{
  "email": "maria@example.com",
  "password": "demo1234"
}
```

Response (200):

```json
{ "ok": true, "message": "Signed in." }
```

Hibak:

- 400: invalid input
- 401: hibas email vagy jelszo

---

### POST /api/auth/logout

Leiras: Kilepes, session torles.

Response (204): No Content

---

## Receptek

### GET /api/recipes/public

Leiras: Publikus receptek listaja.

Response (200):

```json
[
  {
    "id": "seed-1",
    "userId": "system",
    "title": "Margherita pizza",
    "slug": "margherita-pizza",
    "imageUrl": "https://...",
    "ingredients": ["Pizza teszta", "San Marzano paradicsom"],
    "preparation": "...",
    "tags": ["Olasz", "Vegetarianus", "Foetel"],
    "isPublic": true,
    "createdAt": "2026-02-15T10:00:00.000Z"
  }
]
```

---

### GET /api/recipes/me

Leiras: Bejelentkezett felhasznalo receptjei.

Auth: session cookie szukseges.

Response (200):

```json
[
  {
    "id": "seed-6",
    "userId": "seed-user-1",
    "title": "Citromos ricotta teszta",
    "slug": "citromos-ricotta-teszta",
    "imageUrl": "https://...",
    "ingredients": ["250 g spagetti", "1 citrom heja es leve"],
    "preparation": "...",
    "tags": ["Olasz", "Foetel", "Gyors"],
    "isPublic": true,
    "createdAt": "2026-02-19T10:30:00.000Z"
  }
]
```

Hibak:

- 401: nincs bejelentkezve

---

### GET /api/recipes/{slug}

Leiras: Recept lekerese slug alapjan.

Response (200):

```json
{
  "id": "seed-4",
  "userId": "system",
  "title": "Palacsinta",
  "slug": "palacsinta",
  "imageUrl": "https://...",
  "ingredients": ["2 csesze liszt", "2 tojas"],
  "preparation": "...",
  "tags": ["Magyar", "Desszert", "Gyors"],
  "isPublic": true,
  "createdAt": "2026-02-18T11:20:00.000Z"
}
```

Hibak:

- 404: nem talalhato

---

### POST /api/recipes

Leiras: Uj recept letrehozasa.

Auth: session cookie szukseges.

Request body (JSON):

```json
{
  "title": "Palacsinta",
  "imageUrl": "",
  "ingredients": "2 csesze liszt\n2 tojas\n1/2 liter tej",
  "preparation": "Keverd ossze...",
  "tags": "Magyar, Desszert, Gyors",
  "isPublic": true
}
```

Response (200):

```json
{ "ok": true, "message": "Recipe created." }
```

Hibak:

- 401: nincs bejelentkezve
- 400: invalid input

---

### PUT /api/recipes/{id}

Leiras: Recept frissitese.

Auth: session cookie szukseges.

Request body (JSON):

```json
{
  "title": "Palacsinta",
  "imageUrl": "",
  "ingredients": "2 csesze liszt\n2 tojas\n1/2 liter tej",
  "preparation": "Keverd ossze...",
  "tags": "Magyar, Desszert, Gyors",
  "isPublic": true
}
```

Response (204): No Content

Hibak:

- 401: nincs bejelentkezve
- 404: nem talalhato
- 400: invalid input

---

### DELETE /api/recipes/{id}

Leiras: Recept torlese.

Auth: session cookie szukseges.

Response (204): No Content

Hibak:

- 401: nincs bejelentkezve
- 404: nem talalhato

---

## Adatmodellek

### Recipe

```json
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "slug": "string",
  "imageUrl": "string",
  "ingredients": ["string"],
  "preparation": "string",
  "tags": ["string"],
  "isPublic": true,
  "createdAt": "ISO-8601"
}
```

### User (Public)

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "role": "admin | moderator | user",
  "createdAt": "ISO-8601"
}
```
