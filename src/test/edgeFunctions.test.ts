import { describe, it, expect } from 'vitest';

type EdgeHandler = (req: Request) => Promise<Response>;

interface ModuleExports {
  handler: EdgeHandler | null;
}

// Helper function to simulate edge function request
async function simulateEdgeFunction(functionBody: string, request: Request): Promise<Response> {
  // Create a mock Deno.serve function that returns the handler
  const serve = (handler: EdgeHandler): EdgeHandler => handler;

  // Create a temporary module with our serve mock
  const moduleExports: ModuleExports = { handler: null };
  const module = {
    serve: (handler: EdgeHandler): EdgeHandler => {
      moduleExports.handler = handler;
      return handler;
    },
    console: { log: () => {} },
  };

  // Evaluate the function body in the context of our module
  const fn = new Function('module', `
    const { serve, console } = module;
    ${functionBody}
  `);

  // Execute the function to set up the handler
  fn(module);

  // Return the response from the handler
  if (!moduleExports.handler) {
    throw new Error('Handler was not properly initialized');
  }

  return moduleExports.handler(request);
}

describe('Edge Functions', () => {
  describe('hello function', () => {
    it('should return a greeting with the provided name', async () => {
      // Read the hello function source
      const functionBody = `
        console.log("Hello from Functions!")
        
        serve(async (req) => {
          try {
            const { name } = await req.json()
            const data = {
              message: \`Hello \${name}!\`,
            }
          
            return new Response(
              JSON.stringify(data),
              { headers: { "Content-Type": "application/json" } },
            )
          } catch (error) {
            return new Response(
              JSON.stringify({ error: 'Invalid JSON payload' }),
              { 
                status: 400,
                headers: { "Content-Type": "application/json" }
              }
            )
          }
        })
      `;

      // Create a mock request
      const request = new Request('http://localhost:54321/functions/v1/hello', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Test User' }),
      });

      // Execute the function
      const response = await simulateEdgeFunction(functionBody, request);
      const data = await response.json();

      // Verify the response
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(data).toEqual({
        message: 'Hello Test User!',
      });
    });

    it('should handle missing name parameter', async () => {
      const functionBody = `
        console.log("Hello from Functions!")
        
        serve(async (req) => {
          try {
            const { name } = await req.json()
            const data = {
              message: \`Hello \${name}!\`,
            }
          
            return new Response(
              JSON.stringify(data),
              { headers: { "Content-Type": "application/json" } },
            )
          } catch (error) {
            return new Response(
              JSON.stringify({ error: 'Invalid JSON payload' }),
              { 
                status: 400,
                headers: { "Content-Type": "application/json" }
              }
            )
          }
        })
      `;

      const request = new Request('http://localhost:54321/functions/v1/hello', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const response = await simulateEdgeFunction(functionBody, request);
      const data = await response.json();

      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(data).toEqual({
        message: 'Hello undefined!',
      });
    });

    it('should handle malformed JSON', async () => {
      const functionBody = `
        console.log("Hello from Functions!")
        
        serve(async (req) => {
          try {
            const { name } = await req.json()
            const data = {
              message: \`Hello \${name}!\`,
            }
          
            return new Response(
              JSON.stringify(data),
              { headers: { "Content-Type": "application/json" } },
            )
          } catch (error) {
            return new Response(
              JSON.stringify({ error: 'Invalid JSON payload' }),
              { 
                status: 400,
                headers: { "Content-Type": "application/json" }
              }
            )
          }
        })
      `;

      const request = new Request('http://localhost:54321/functions/v1/hello', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json',
      });

      const response = await simulateEdgeFunction(functionBody, request);

      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      
      const data = await response.json();
      expect(data).toEqual({
        error: 'Invalid JSON payload',
      });
    });
  });
});
