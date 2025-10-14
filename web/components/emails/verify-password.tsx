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
} from '@react-email/components';

type VerifyPasswordProps = {
    username: string, verifyUrl: string
}

const VerifyPassword = ({ username, verifyUrl }: VerifyPasswordProps) => {
    return (
        <Html lang="en" dir="ltr">
            <Tailwind>
                <Head />
                <Body className="bg-gray-100 font-sans py-[40px]">
                    <Container className="bg-white rounded-[8px] p-[32px] max-w-[600px] mx-auto">
                        <Section>
                            <Text className="text-[32px] font-bold text-gray-900 mb-[24px] text-center">
                                Confirm Your Email Address
                            </Text>

                            <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                                Hi {username},
                            </Text>

                            <Text className="text-[16px] text-gray-700 mb-[24px] leading-[24px]">
                                Thanks for signing up! We&apos;re excited to have you on board. To get started and ensure the security of your account, please confirm your email address by clicking the button below.
                            </Text>

                            <Section className="text-center mb-[32px]">
                                <Button
                                    href={verifyUrl}
                                    className="bg-blue-600 text-white px-[32px] py-[16px] rounded-[8px] text-[16px] font-semibold no-underline box-border"
                                >
                                    Confirm Email Address
                                </Button>
                            </Section>

                            <Text className="text-[14px] text-gray-600 mb-[24px] leading-[20px]">
                                If the button above doesn&apos;t work, you can also copy and paste the following link into your browser:
                            </Text>

                            <Text className="text-[14px] text-blue-600 mb-[32px] break-all">
                                {verifyUrl}
                            </Text>

                            <Text className="text-[14px] text-gray-600 mb-[24px] leading-[20px]">
                                This confirmation link will expire in 24 hours for security purposes. If you didn&apos;t create an account with us, you can safely ignore this email.
                            </Text>

                            <Text className="text-[16px] text-gray-700 mb-[32px] leading-[24px]">
                                Best regards,<br />
                                The Team
                            </Text>
                        </Section>

                        <Hr className="border-gray-200 my-[32px]" />

                        <Section>
                            <Text className="text-[12px] text-gray-500 text-center m-0 mb-[8px]">
                                © 2025 Your Company Name. All rights reserved.
                            </Text>
                            <Text className="text-[12px] text-gray-500 text-center m-0 mb-[8px]">
                                123 Business Street, Suite 100, Toronto, ON M5V 3A8, Canada
                            </Text>
                            <Text className="text-[12px] text-gray-500 text-center m-0">
                                <a href="#" className="text-gray-500 no-underline">Unsubscribe</a> |
                                <a href="#" className="text-gray-500 no-underline ml-[4px]">Privacy Policy</a>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};


export default VerifyPassword;