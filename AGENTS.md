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

## App architecture
- Keep Qoshul's mobile shell and Cloud-backed event state in shared browser-safe components and context so all content routes share navigation and event actions.
- Persist chats in Cloud with participant-scoped RLS and refresh via subscriptions with polling fallback; never show fabricated participants or match percentages as real results.
- Keep venue-category selection in a pure tested module and pass venues into the lazy map, so event and partner map rendering remain SSR-safe.
- Define product rules in a pure module with focused tests so XP and rank boundaries remain consistent across screens.
- Cities and categories live in pure catalog modules under src/lib/qoshul so every screen and the AI prompts share one list.
- Maps load Leaflet only in the browser via a lazy wrapper, because Leaflet touches window and would break SSR.
- AI calls go through one server route that streams plain text from the gateway, so the key stays server-side and the UI can stream.
