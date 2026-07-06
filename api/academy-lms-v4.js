import { app } from "@azure/functions";
import { proxyCentralRequest } from "./central-proxy.js";

app.http("academy-lms-v4", {
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  authLevel: "anonymous",
  route: "academy-lms",
  handler: async (request) => {
    if (request.method === "OPTIONS") return { status: 204 };
    return proxyCentralRequest(request, "/academy-lms");
  },
});
