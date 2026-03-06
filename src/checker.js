const IGNORED_PROTOCOLS = [
  "chrome:",
  "chrome-extension:",
  "moz-extension:",
  "about:",
  "edge:",
  "data:",
  "file:",
  "brave:",
  "vivaldi:",
];

export function isDomainMatch(hostname, domains) {
  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i];
    if (hostname === domain) {
      return true;
    }
    if (hostname.endsWith("." + domain)) {
      return true;
    }
  }
  return false;
}

function extractKeywords(domains) {
  const keywords = [];

  for (let i = 0; i < domains.length; i++) {
    const domain = domains[i];
    const parts = domain.split(".");

    if (parts.length < 2) {
      keywords.push(domain);
      continue;
    }

    const secondToLast = parts[parts.length - 2];
    let isTwoPartTld = false;

    if (
      secondToLast === "co" || secondToLast === "com" ||
      secondToLast === "net" || secondToLast === "org" || secondToLast === "in"
    ) {
      isTwoPartTld = true;
    }

    let mainIndex = parts.length - 2;
    if (isTwoPartTld) {
      mainIndex = parts.length - 3;
    }

    if (mainIndex >= 0) {
      keywords.push(parts[mainIndex]);
    } else {
      keywords.push(domain);
    }
  }

  return keywords;
}

function matchAnyKeyword(hostname, keywords) {
  for (let i = 0; i < keywords.length; i++) {
    const keyword = keywords[i];

    if (keyword.length >= 3) {
      if (hostname.includes(keyword)) {
        return true;
      }
    }
  }

  return false;
}

function getPhishingMatch(hostname, entries) {
  if (!entries) {
    return null;
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    if (!entry.d) {
      continue;
    }

    let keywords = entry.k;
    if (!keywords || keywords.length === 0) {
      keywords = extractKeywords(entry.d);
    }

    const isMatch = matchAnyKeyword(hostname, keywords);

    if (isMatch) {
      return {
        action: "block",
        status: "red",
        category: "Potential Phishing",
        reason: "This website appears to be imitating " + entry.d[0] + ".",
      };
    }
  }

  return null;
}

function isProtocolIgnored(protocol) {
  for (let i = 0; i < IGNORED_PROTOCOLS.length; i++) {
    if (protocol === IGNORED_PROTOCOLS[i]) {
      return true;
    }
  }
  return false;
}

function listContainsDomain(hostname, list) {
  if (!list) return false;

  for (let i = 0; i < list.length; i++) {
    const entry = list[i];

    if (entry.d) {
      if (isDomainMatch(hostname, entry.d)) {
        return true;
      }
    }
  }

  return false;
}

function checkGreenList(hostname, dataset) {
  if (listContainsDomain(hostname, dataset.green)) {
    return { action: "allow", status: "green" };
  }
  return null;
}

function checkYellowList(hostname, dataset) {
  if (listContainsDomain(hostname, dataset.yellow)) {
    return {
      action: "notify",
      status: "yellow",
      category: "Unofficial Website",
      reason: "This is not the official website. Proceed with caution.",
    };
  }
  return null;
}

export function checkUrlStatus(url, dataset) {
  try {
    if (url.includes("asli_bypass=true")) {
      return { action: "allow", status: "green" };
    }

    const urlObj = new URL(url);
    const protocol = urlObj.protocol;
    const hostname = urlObj.hostname;

    if (isProtocolIgnored(protocol)) {
      return { action: "allow", status: "unknown" };
    }

    const greenMatch = checkGreenList(hostname, dataset);
    if (greenMatch) {
      return greenMatch;
    }

    const yellowMatch = checkYellowList(hostname, dataset);
    if (yellowMatch) {
      return yellowMatch;
    }

    const phishingMatchGreen = getPhishingMatch(hostname, dataset.green);
    if (phishingMatchGreen) {
      return phishingMatchGreen;
    }

    const phishingMatchYellow = getPhishingMatch(hostname, dataset.yellow);
    if (phishingMatchYellow) {
      return phishingMatchYellow;
    }

    return { action: "allow", status: "unknown" };
  } catch (error) {
    console.error("Check error:", error);
    return { action: "allow", status: "unknown" };
  }
}
