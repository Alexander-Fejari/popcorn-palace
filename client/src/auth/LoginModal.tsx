import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useAuth } from "./useAuth";
import Modal from "../components/Modal";
import Typography from "../components/Typography";
import Input from "../components/Input";
import Checkbox from "../components/Checkbox";
import Button from "../components/Button";
import Link from "../components/Link";

const LoginModal = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, handleLogin } = useAuth();

  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  useEffect(() => {
    if (!isLoginModalOpen) {
      setLoginError(null);
    }
  }, [isLoginModalOpen]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: newValue });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const loginSuccessful = await handleLogin(formData);
    setIsLoading(false);
    if (loginSuccessful) {
      setIsLoginModalOpen(false)
      setLoginError(null)
    } else {
      setLoginError("Email ou mot de passe incorrect")
    }
  };

  return (
    <Modal isOpen={isLoginModalOpen} setIsOpen={setIsLoginModalOpen}>
      <Typography as="h2" variant="h2" className="pr-8">Connectez-vous à votre compte</Typography>
      
      <form onSubmit={handleSubmit}>
        <Input 
          label="Email"
          type="email"
          name="email"
          onChange={handleInputChange}
        />
        <Input 
          label="Password"
          type="password"
          name="password"
          error={loginError}
          onChange={handleInputChange}
        />
        <Checkbox
          label="Se souvenir de moi"
          name="remember"
          onChange={handleInputChange}
        />
        <Button type="submit" variant="primary" loading={isLoading} className="w-full mt-8 mb-2">Se connecter</Button>
        <Typography as="p" variant="small" className="text-center text-white-muted">
          Vous n’avez pas de compte ? <Link type='button' onClick={()=>{console.log('signup')}}>S’inscrire</Link>
        </Typography>
      </form>
    </Modal>
  );
};

export default LoginModal;