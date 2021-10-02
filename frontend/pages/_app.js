import { Toaster } from 'react-hot-toast';
import '../styles/app.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default MyApp;
