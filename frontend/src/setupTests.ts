// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// React 18 act 경고 해결
import { configure } from '@testing-library/react';

configure({
  // React 18의 새로운 act를 사용하도록 설정
  asyncUtilTimeout: 2000,
});
