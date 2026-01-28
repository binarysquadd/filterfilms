export default function getErrorMessage(error: string): string {
  switch (error) {
    case 'OAuthSignin':
      return 'Error occurred during sign in. Please try again.';
    case 'OAuthCallback':
      return 'Error occurred during callback. Please try again.';
    case 'OAuthCreateAccount':
      return 'Could not create account. Please try again.';
    case 'EmailCreateAccount':
      return 'Could not create account. Please try again.';
    case 'Callback':
      return 'Error occurred during callback. Please try again.';
    case 'OAuthAccountNotLinked':
      return 'Email already associated with another account.';
    case 'EmailSignin':
      return 'Check your email for the sign in link.';
    case 'CredentialsSignin':
      return 'Invalid credentials. Please check your email and password.';
    case 'SessionRequired':
      return 'Please sign in to access this page.';
    default:
      return 'An error occurred. Please try again.';
  }
}
