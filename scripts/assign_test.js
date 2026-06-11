import { assignUserRole } from '../src/app/actions';

(async () => {
  const uid = 'test-uid-123';
  const email = 'test@example.com';
  const code = undefined; // employee
  const res = await assignUserRole(uid, email, code);
  console.log('assignUserRole result:', res);
})();
