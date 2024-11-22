import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  Theme,
} from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { type UserRole } from "@prisma/client";
import Okta from "next-auth/providers/okta";
import {mockSession} from "next-auth/client/__tests__/helpers/mocks";
import user = mockSession.user;

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email?: string;
      name?: string;
      role: UserRole;
      groupId: number;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    groupId: number;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
/**
 * todo - configure toggle for dark and light mode
 */


export const authOptions: NextAuthOptions = {
  theme: {
    colorScheme: "dark",
    brandColor: "#319795",
  },
  callbacks: {
    async signIn({ user}) {
      // Block users from creating an account if they do not already belong in the database
      const u = await prisma.user.findUnique({where: { email: user.email || undefined }})

      if (u) {
        return true
      } else {
        return '/unauthorized'
      }
    },

    session({ session, user }) {
      // Add custom properties to the session object here if needed
      // For example, attaching the role and groupId from the user record to the session
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.groupId = user.groupId;
      }
      return session;
    },
  },

  adapter: PrismaAdapter(prisma),
  providers: [
    // Email({
    //   server: {
    //     host: env.EMAIL_HOST,
    //     port: Number(env.EMAIL_PORT),
    //     auth: {
    //       user: env.EMAIL_USERNAME,
    //       pass: env.EMAIL_PASSWORD,
    //     },
    //   },
    //   from: env.EMAIL_FROM,
    //
    //   sendVerificationRequest: async ({identifier: email, provider: {server, from}, url, theme}) => {
    //       const { host } = new URL(url);
    //       const transport = createTransport(server);
    //       const result = await transport.sendMail({
    //         to: email,
    //         from: from,
    //         subject: `Sign in to ${host}`,
    //         text: text({ url, host }),
    //         html: html({ url, host, theme }),
    //       });
    //
    //       const failed = result.rejected.concat(result.pending).filter(Boolean);
    //       if (failed.length) {
    //         throw new Error(
    //           `Email(s) (${failed.join(", ")}) could not be sent`
    //         );
    //       }
    //     },
    // }),

    Okta({
      clientId: env.AUTH0_CLIENT_ID,
      clientSecret: env.AUTH0_CLIENT_SECRET,
      issuer: env.AUTH0_ISSUER,
      allowDangerousEmailAccountLinking: true
    }),

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We don't add the email address to avoid needing to escape it, if you do, remember to sanitize it!
 */
function html(params: { url: string; host: string; theme: Theme }) {
  const { url, host, theme } = params;

  const escapedHost = host.replace(/\./g, "&#8203;.");

  const brandColor = theme.brandColor || "#346df1";
  const color = {
    background: "#f9f9f9",
    text: "#444",
    mainBackground: "#fff",
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: theme.buttonText || "#fff",
  };

  return `
<body style="background: ${color.background};">
   <table width="100%" border="0" cellspacing="20" cellpadding="0"
      style="background: ${color.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
      <tr>
         <td align="center"
            style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
            Sign in to <strong>${escapedHost}</strong>
         </td>
      </tr>
      <tr>
         <td align="center" style="padding: 20px 0;">
            <table border="0" cellspacing="0" cellpadding="0">
               <tr>
                  <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}">
                     <a href="${url}"
                        target="_blank"
                        style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">Sign
                     in</a>
                  </td>
               </tr>
            </table>
         </td>
      </tr>
      <tr>
         <td align="center"
            style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: helvetica, arial, sans-serif; color: ${color.text};">
            <a href="" style="text-decoration:none !important; text-decoration:none;">${url}</a> </td>
      </tr>
      <tr>
         <td align="center"
            style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
            If you did not request this email you can safely ignore it.
         </td>
      </tr>
   </table>
</body>
`;
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`;
}
