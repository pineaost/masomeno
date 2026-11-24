import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const config: NextConfig = {
  devIndicators: false,
  logging: {
    incomingRequests: { ignore: [/\/auth\/(callback|confirm)(?:[/?]|$)/] },
    serverFunctions: false,
  },
};

export default createNextIntlPlugin()(config);
