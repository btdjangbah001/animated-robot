import LoginForm from "../../../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-center space-x-2">
          <img
            src="https://platformstyles.com/government-projects/assets/images/citizen-portal/coa.svg"
            alt="Ghana Coat of Arms"
            className="w-13 h-13"
          />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
