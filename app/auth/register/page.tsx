import RegisterForm from "../../../components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center space-x-2">
          <img
            src="https://platformstyles.com/government-projects/assets/images/citizen-portal/coa.svg"
            alt="Ghana Coat of Arms"
            className="w-13 h-13"
          />
        </div>
        <RegisterForm />
        <footer className="text-center text-sm text-gray-500">
          By creating an account, you agree to our{" "}
          <a href="#" className="hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
        </footer>
      </div>
    </div>
  );
}
