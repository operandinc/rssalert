This is the source code for [RSS Alert](https://rssalert.operand.ai), a tool to get email notifications about semantically matching content in RSS feed(s). It is built with the [Operand API](https://operand.ai). This repo is MIT licensed, and we encourage you to fork + alter it as you see fit. If you need help getting started with Operand, our [docs](https://docs.operand.ai) might help, and if this still doesn't answer all your questions, [reach out](https://docs.operand.ai/start#getting-help)!

Required environment variables:

- `DATABASE_URL`: For PlanetScale.
- `OPERAND_API_KEY`: For Operand.
- `OPERAND_ENDPOINT`: For Operand.
- `OPERAND_PARENT_ID`: For Operand (optional).
- `POSTMARK_SERVER_TOKEN`: For Postmark.
