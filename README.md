# El bloc de Rossi (PWA)

Notas, plantillas y un mensajito diario. Funciona sin internet y sincroniza con Supabase.

## 1. Supabase
1. En tu proyecto, abre **SQL Editor**, pega `supabase.sql` y ejecútalo.
2. **Authentication > Users > Add user**: crea el usuario de Rossi (correo y contraseña, marca "Auto confirm").
3. **Authentication > Sign In / Providers**: desactiva "Allow new users to sign up".
4. **Project Settings > API**: copia la URL y la `anon` key en `config.js`.

## 2. Probar en tu PC (PowerShell)
Abre la carpeta en VS Code y usa Live Server. Mientras `config.js` tenga "TU-PROYECTO", corre en modo local sin login.
Si cambias archivos y no ves cambios, en DevTools > Application > Service Workers marca "Update on reload".

## 3. Publicar en GitHub Pages
```
git init
git add .
git commit -m "Bloc de Rossi"
git branch -M main
git remote add origin https://github.com/EverArteaga/bloc-rossi.git
git push -u origin main
```
Luego en el repo: **Settings > Pages > Deploy from a branch > main / (root)**.
URL: https://everarteaga.github.io/bloc-rossi/

## 4. Instalar en el celular de Rossi
Abrir la URL en Chrome, entrar con su correo y tocar **Instalar app** (o menú > Instalar aplicación).

## Al actualizar la app
Sube el número de `VERSION` en `sw.js` (por ejemplo `bloc-v2`) antes de hacer push.

## Notas
- Los mensajes diarios están en la lista `MSGS` de `app.js`.
- Cada nota solo la puede leer su dueña desde la app (RLS), pero como administrador del proyecto tú las verías en el panel de Supabase.
