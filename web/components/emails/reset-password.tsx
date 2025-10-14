import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type ResetPasswordProps = {
  username?: string | null;
  resetUrl: string;
};

const ResetPasswordEmail = ({ username, resetUrl }: ResetPasswordProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white rounded-[8px] p-[32px] max-w-[600px] mx-auto">
            <Section>
              <Text className="text-[28px] font-bold text-gray-900 mb-[24px] text-center">
                Reset Your Password
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[16px] leading-[24px]">
                {username ? `Hi ${username},` : "Hi there,"}
              </Text>

              <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                We received a request to reset your password. Click the button
                below to choose a new password.
              </Text>

              <Section className="text-center mb-[32px]">
                <Button
                  href={resetUrl}
                  className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border"
                >
                  Reset Password
                </Button>
              </Section>

              <Text className="text-[14px] text-gray-600 mb-[24px] leading-[20px]">
                If the button doesn't work, copy and paste this link into your
                browser:
              </Text>

              <Text className="text-[14px] text-blue-600 mb-[24px] break-all">
                {resetUrl}
              </Text>

              <Text className="text-[14px] text-gray-600 leading-[20px]">
                This link expires in 1 hour. If you didn&apos;t request a password
                reset, you can safely ignore this email.
              </Text>
            </Section>

            <Hr className="border-gray-200 my-[32px]" />

            <Section>
              <Text className="text-[12px] text-gray-500 text-center m-0 mb-[8px]">
                © {new Date().getFullYear()} Your Company Name. All rights
                reserved.
              </Text>
              <Text className="text-[12px] text-gray-500 text-center m-0">
                <a href="#" className="text-gray-500 no-underline">
                  Privacy Policy
                </a>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default ResetPasswordEmail;

