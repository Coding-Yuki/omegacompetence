import { registerUser } from "./src/app/actions";

(async () => {
  console.log("Creating first user...");
  const first = await registerUser("test@example.com", "Password123");
  console.log("First result:", first);
  console.log("Creating duplicate user to trigger error logging...");
  const second = await registerUser("test@example.com", "Password123");
  console.log("Second result:", second);
})();
