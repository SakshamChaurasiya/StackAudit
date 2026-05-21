# Unit Economics

## Cost drivers (estimated)

| Item            | Model              | Notes                          |
| --------------- | ------------------ | ------------------------------ |
| Vercel          | Hobby → Pro        | Low until traffic spikes       |
| Supabase        | Free tier → Pro    | Row storage per audit          |
| Anthropic API   | Per summary        | ~100 words × audits/day        |
| Resend          | Per email          | Lead notification only         |

## Variable cost per audit (rough)

- DB write: negligible on free tier
- AI summary: ~$0.01–0.05 depending on model
- Email: ~$0.001

**Target:** &lt; $0.10 fully loaded cost per completed audit at MVP scale.

## Revenue hypothesis

- Lead gen → consulting / tool affiliate (later)
- B2B SaaS subscription for ongoing monitoring (v2)

## Break-even

_TBD after first 100 audits and actual API bills._
