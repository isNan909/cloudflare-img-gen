export interface Env {
  AI: any;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    try {
      const { prompt, model } = await request.json<{ prompt: string; model?: string }>();

      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "Prompt is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const targetModel = model || '@cf/stabilityai/stable-diffusion-xl-base-1.0';
      const aiResponse = await env.AI.run(targetModel, { prompt });

      return new Response(aiResponse, {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });

    } catch (error: any) {
      return new Response(
        JSON.stringify({
          error: error.message || 'Generation failed at edge node.',
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }
  }
};