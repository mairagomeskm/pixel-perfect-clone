<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Carita's Pets architecture
- Data access uses the browser Lovable Cloud client with RLS (no server functions yet) — simplest path; RLS is the security boundary.
- Signed-in pages live under src/routes/_authenticated/ — managed gate redirects to /auth.
- Public storage buckets are blocked in this workspace: public photos go to private bucket `media` with long-lived signed URLs stored in the row; chat files and residence proofs use private buckets read via short signed URLs.
- First user to sign up becomes admin (trigger handle_new_user); roles live in user_roles + has_role().
- Form autosave drafts are stored in localStorage (src/lib/drafts.ts) — per-device convenience, not shared data.
- App chrome (header, back button, side menu, bottom nav, footer, auth dialog) lives in src/components/layout/AppShell.tsx.
