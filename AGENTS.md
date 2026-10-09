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
- Keep Qoshul's mobile shell and sample event state in shared browser-safe components and context so all content routes share navigation and event actions.
- This mobile variation uses in-memory demo data; do not present mock matching or messages as connected AI or realtime services.
- Define product rules in a pure module with focused tests so XP and rank boundaries remain consistent across screens.
