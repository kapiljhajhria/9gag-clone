import React from "react";
import { Formik, Form } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { Box, Button, Flex, Link } from "@chakra-ui/core";
import { MeDocument, MeQuery, useLoginMutation } from "../generated/graphql";
import toErrorMap from "../utils/toErrorMap";
import { useRouter } from "next/router";
import NextLink from "next/link";
import Layout from "../components/Layout";
import { withApollo } from "../utils/withApollo";

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [login] = useLoginMutation();
  return (
    <Layout>
      <head>
        <title>Login</title>
      </head>
      <Wrapper variant="small">
        <Formik
          initialValues={{ usernameOrEmail: "", password: "" }}
          onSubmit={async (values, { setErrors }) => {
            const response = await login({
              variables: values,
              update: (cache, { data }) => {
                cache.writeQuery<MeQuery>({
                  query: MeDocument,
                  data: {
                    __typename: "Query",
                    me: data?.login.user,
                  },
                }),
                  cache.evict({ fieldName: "posts:{}" });
              },
            });
            if (response.data?.login.errors) {
              setErrors(toErrorMap(response.data.login.errors));
            } else if (response.data?.login.user) {
              if (typeof router.query.next === "string") {
                router.push(router.query.next);
              } else {
                router.push("/");
              }
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name="usernameOrEmail"
                placeholder="Username Or Email"
                label="Username Or Email"
              />
              <Box mt={4}>
                <InputField
                  name="password"
                  placeholder="Password"
                  label="password"
                  type="password"
                />
                <Flex>
                  <NextLink href="forgot-password">
                    <Link mt="1" ml="auto">
                      Forgot Password?
                    </Link>
                  </NextLink>
                </Flex>
              </Box>
              <Box mt={4}>
                <Button
                  type="submit"
                  variantColor="twitter"
                  isLoading={isSubmitting}
                >
                  Login
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </Layout>
  );
};

export default withApollo({ ssr: false })(Login);
