const API_DATA_ENDPOINT = "/api/data";
const API_BACKUP_ENDPOINT = "/api/backup";
const SITE_CONFIG = window.__BRANDREAM_SITE_CONFIG__ || null;
const PLATFORMS = ["TikTok", "Instagram", "Facebook", "Pinterest"];
const FOLLOWER_TIERS = ["Nano", "Micro", "Mid-tier", "Macro", "Mega"];
const PRIORITIES = ["A", "A-", "B+", "B", "C+"];
const STATUSES = [
  "未联系",
  "已联系未回复",
  "已回复沟通中",
  "待报价",
  "已报价待确认",
  "已寄样",
  "合作进行中",
  "已发布内容",
  "已完成",
  "不合作",
];
const IMAGE_TYPES = ["主页截图", "作品截图", "审美参考图"];

const state = {
  view: "dashboard",
  influencerViewMode: "table",
  detailTab: "overview",
  search: "",
  filters: {
    platform: "全部",
    country: "全部",
    contacted: "全部",
    status: "全部",
    priority: "全部",
    followerTier: "全部",
    report: "全部",
    deleted: "隐藏",
  },
  selectedInfluencerIds: new Set(),
  activeInfluencerId: null,
  deleteTargetId: null,
  editingInfluencerId: null,
  editingBrandId: null,
  timelineTargetId: null,
  storage: {
    mode: "unknown",
    shared: false,
    label: "连接中",
    hint: "正在检测当前存储模式...",
  },
  data: createEmptyData(),
};

const nodes = {
  viewTitle: document.querySelector("#view-title"),
  viewEyebrow: document.querySelector("#view-eyebrow"),
  navLinks: document.querySelectorAll(".nav-link"),
  dashboardView: document.querySelector("#dashboard-view"),
  influencersView: document.querySelector("#influencers-view"),
  brandsView: document.querySelector("#brands-view"),
  reportsView: document.querySelector("#reports-view"),
  topbarActions: document.querySelector(".topbar-actions"),
  sidebarNote: document.querySelector(".sidebar-note"),
  globalSearch: document.querySelector("#global-search"),
  influencerModal: document.querySelector("#influencer-modal"),
  influencerForm: document.querySelector("#influencer-form"),
  autofillTrigger: document.querySelector("#autofill-trigger"),
  autofillNote: document.querySelector("#autofill-note"),
  brandModal: document.querySelector("#brand-modal"),
  brandForm: document.querySelector("#brand-form"),
  deleteModal: document.querySelector("#delete-modal"),
  deleteForm: document.querySelector("#delete-form"),
  bulkDeleteModal: document.querySelector("#bulk-delete-modal"),
  bulkDeleteForm: document.querySelector("#bulk-delete-form"),
  timelineModal: document.querySelector("#timeline-modal"),
  timelineForm: document.querySelector("#timeline-form"),
  addInfluencerTrigger: document.querySelector("#add-influencer-trigger"),
  addBrandTrigger: document.querySelector("#add-brand-trigger"),
  backupDataTrigger: document.querySelector("#backup-data-trigger"),
  influencerModalEyebrow: document.querySelector("#influencer-modal-eyebrow"),
  influencerModalTitle: document.querySelector("#influencer-form .modal-header h3"),
  influencerSubmitLabel: document.querySelector("#influencer-form .footer-actions .primary-button"),
  storageStatusChip: document.querySelector("#storage-status-chip"),
};

function seedData() {
  if (window.__APP_IMPORTED_DATA?.influencers?.length) {
    return sanitizeData(window.__APP_IMPORTED_DATA);
  }
  const now = new Date().toISOString();
  return {
    influencers: [
      {
        id: crypto.randomUUID(),
        platform: "Instagram",
        accountHandle: "@mengmengliving",
        displayName: "Mengmeng Living",
        profileUrl: "https://www.instagram.com/mengmengliving",
        country: "Hungary",
        followerCount: 42000,
        followerTier: "Micro",
        contentType: "Interior / Lifestyle / Product photography",
        bioKeywords: "Interior, lifestyle, cozy bedroom, UGC",
        avatarUrl: "",
        autoFillStatus: "已抓取",
        fitReason: "审美与 romantic bedding 匹配，适合卧室氛围内容。",
        recommendedProducts: "Floral duvet cover, quilt, cottage bedding",
        contactInfo: "DM first",
        priority: "A-",
        status: "未联系",
        isContacted: false,
        firstContactChannel: "DM",
        quoteAmount: "",
        notes: "优先确认受众地区与寄样可达性。",
        isSelectedForReport: true,
        isDeleted: false,
        deletedAt: "",
        deletionReason: "",
        images: [
          {
            id: crypto.randomUUID(),
            type: "主页截图",
            title: "主页氛围图",
            note: "整体 bedroom 视觉很贴 Brandream。",
            imageData: "",
          },
          {
            id: crypto.randomUUID(),
            type: "审美参考图",
            title: "审美参考",
            note: "柔和花卉感适合 Pretty Bedding。",
            imageData: "",
          },
        ],
        logs: [
          createLog("新增", "创建达人档案", now),
          createLog("自动回填", "根据链接识别账号、平台和基础资料", now),
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        platform: "TikTok",
        accountHandle: "@cozydormfinds",
        displayName: "Cozy Dorm Finds",
        profileUrl: "https://www.tiktok.com/@cozydormfinds",
        country: "United States",
        followerCount: 88500,
        followerTier: "Mid-tier",
        contentType: "Dorm inspiration / Amazon finds / Back to school",
        bioKeywords: "Dorm room, twin xl, Amazon finds",
        avatarUrl: "",
        autoFillStatus: "已抓取",
        fitReason: "很适合 Twin XL、开学季和 dorm 主题。",
        recommendedProducts: "Twin XL quilt, bedding set, bed skirt",
        contactInfo: "Email in bio",
        priority: "A",
        status: "待报价",
        isContacted: true,
        firstContactChannel: "Email",
        quoteAmount: "$350 / 1 video",
        notes: "适合做 Back to School 第一波名单。",
        isSelectedForReport: true,
        isDeleted: false,
        deletedAt: "",
        deletionReason: "",
        images: [
          {
            id: crypto.randomUUID(),
            type: "作品截图",
            title: "Dorm 视频截图",
            note: "典型宿舍场景，转化导向强。",
            imageData: "",
          },
        ],
        logs: [
          createLog("新增", "创建达人档案", now),
          createLog("自动回填", "根据链接识别账号、平台和基础资料", now),
          createLog("已联系", "已通过邮箱联系并索要报价", now),
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: crypto.randomUUID(),
        platform: "Facebook",
        accountHandle: "@classicbedroomideas",
        displayName: "Classic Bedroom Ideas",
        profileUrl: "https://facebook.com/classicbedroomideas",
        country: "Canada",
        followerCount: 18000,
        followerTier: "Nano",
        contentType: "Bedroom styling / Home inspiration",
        bioKeywords: "Classic home, bedroom refresh",
        avatarUrl: "",
        autoFillStatus: "部分抓取失败",
        fitReason: "内容匹配一般，可保留观察。",
        recommendedProducts: "Quilt, floral sheet set",
        contactInfo: "Messenger",
        priority: "B+",
        status: "已回复沟通中",
        isContacted: true,
        firstContactChannel: "Messenger",
        quoteAmount: "",
        notes: "等对方提供近期受众分布。",
        isSelectedForReport: false,
        isDeleted: false,
        deletedAt: "",
        deletionReason: "",
        images: [],
        logs: [
          createLog("新增", "创建达人档案", now),
          createLog("已联系", "已通过 Messenger 联系", now),
          createLog("已回复", "对方回复可合作，待补 audience 数据", now),
        ],
        createdAt: now,
        updatedAt: now,
      },
    ],
    brands: [
      {
        id: crypto.randomUUID(),
        brandName: "Sweet Jojo Designs",
        country: "United States",
        category: "Kids bedding / Dorm",
        priceBand: "$39-$99",
        brandIntro: "以儿童房、宿舍和家居软装为主的 bedding 品牌。",
        amazonUrl: "https://www.amazon.com",
        websiteUrl: "https://sweetjojodesigns.com",
        parentCompany: "Sweet Jojo Designs",
        sourceNote: "Instagram creator mentions",
        relatedInfluencers: "@cozydormfinds",
        notes: "适合持续跟踪宿舍类内容。",
      },
      {
        id: crypto.randomUUID(),
        brandName: "Levtex Home",
        country: "United States",
        category: "Bedding",
        priceBand: "$59-$149",
        brandIntro: "家居软装和 bedding 品牌，视觉偏成熟。",
        amazonUrl: "https://www.amazon.com",
        websiteUrl: "https://levtexhome.com",
        parentCompany: "Levtex",
        sourceNote: "Pinterest board",
        relatedInfluencers: "@mengmengliving",
        notes: "适合比对花型和整体视觉调性。",
      },
    ],
  };
}

function createLog(actionType, actionNote, actionDate = new Date().toISOString()) {
  return { id: crypto.randomUUID(), actionType, actionNote, actionDate };
}

function createEmptyData() {
  return sanitizeData({
    version: "db-seed-1",
    influencers: [],
    brands: [],
  });
}

function cloneData(data) {
  if (typeof structuredClone === "function") {
    return structuredClone(data);
  }
  return JSON.parse(JSON.stringify(data));
}

function sanitizeData(data) {
  const safe = data && typeof data === "object" ? cloneData(data) : { version: "db-seed-1" };
  if (!Array.isArray(safe.influencers)) safe.influencers = [];
  if (!Array.isArray(safe.brands)) safe.brands = [];
  safe.version ||= "db-seed-1";
  safe.brands = safe.brands.filter((brand) => (brand.brandName || "").trim().toLowerCase() !== "brandream");
  return safe;
}

function isSupabaseBrowserMode() {
  return Boolean(
    SITE_CONFIG &&
      SITE_CONFIG.mode === "supabase-browser" &&
      SITE_CONFIG.supabaseUrl &&
      SITE_CONFIG.supabasePublishableKey,
  );
}

function getSupabaseBrowserConfig() {
  if (!isSupabaseBrowserMode()) return null;
  return {
    url: SITE_CONFIG.supabaseUrl.replace(/\/+$/, ""),
    publishableKey: SITE_CONFIG.supabasePublishableKey,
    table: SITE_CONFIG.stateTable || "app_state",
    stateKey: SITE_CONFIG.stateKey || "brandream-main",
  };
}

async function supabaseBrowserRequest(method, path, { body, prefer } = {}) {
  const config = getSupabaseBrowserConfig();
  if (!config) {
    throw new Error("Supabase browser storage is not configured.");
  }

  const headers = {
    apikey: config.publishableKey,
    Authorization: `Bearer ${config.publishableKey}`,
    Accept: "application/json",
  };

  if (prefer) headers.Prefer = prefer;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${config.url}${path}`, {
    method,
    cache: "no-store",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase browser request failed (${response.status}): ${detail}`);
  }

  return response.json();
}

async function fetchDataFromServer() {
  if (isSupabaseBrowserMode()) {
    const config = getSupabaseBrowserConfig();
    const rows = await supabaseBrowserRequest(
      "GET",
      `/rest/v1/${config.table}?id=eq.${encodeURIComponent(config.stateKey)}&select=id,payload,updated_at&limit=1`,
      { prefer: "count=exact" },
    );
    const row = rows[0];
    return sanitizeData(row?.payload || createEmptyData());
  }

  const response = await fetch(API_DATA_ENDPOINT, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.status}`);
  }
  const payload = await response.json();
  return sanitizeData(payload.data || payload);
}

async function fetchStorageHealth() {
  if (isSupabaseBrowserMode()) {
    const config = getSupabaseBrowserConfig();
    const rows = await supabaseBrowserRequest(
      "GET",
      `/rest/v1/${config.table}?id=eq.${encodeURIComponent(config.stateKey)}&select=id,updated_at&limit=1`,
      { prefer: "count=exact" },
    );
    const row = rows[0];
    return {
      ok: true,
      storageMode: "cloud-supabase",
      provider: "supabase-browser",
      table: config.table,
      stateKey: config.stateKey,
      updatedAt: row?.updated_at || "",
    };
  }

  const response = await fetch("/api/health", {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load storage health: ${response.status}`);
  }

  return response.json();
}

async function pushDataToServer(snapshot) {
  if (isSupabaseBrowserMode()) {
    const config = getSupabaseBrowserConfig();
    const rows = await supabaseBrowserRequest(
      "POST",
      `/rest/v1/${config.table}?on_conflict=id`,
      {
        prefer: "resolution=merge-duplicates,return=representation",
        body: [
          {
            id: config.stateKey,
            payload: sanitizeData(snapshot),
            updated_at: new Date().toISOString(),
          },
        ],
      },
    );
    const row = rows[0];
    return sanitizeData(row?.payload || snapshot);
  }

  const response = await fetch(API_DATA_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ data: snapshot }),
  });
  if (!response.ok) {
    throw new Error(`Failed to save data: ${response.status}`);
  }
  const payload = await response.json();
  return sanitizeData(payload.data || snapshot);
}

async function requestLocalBackup() {
  if (isSupabaseBrowserMode()) {
    return {
      storageMode: "cloud-supabase",
      backupDir: "",
      dbBackupPath: null,
      jsonBackupPath: null,
    };
  }

  const response = await fetch(API_BACKUP_ENDPOINT, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to create backup: ${response.status}`);
  }
  return response.json();
}

let saveQueue = Promise.resolve();

function saveData() {
  const snapshot = sanitizeData(state.data);
  state.data = snapshot;
  saveQueue = saveQueue
    .catch(() => undefined)
    .then(async () => {
      const saved = await pushDataToServer(snapshot);
      state.data = saved;
    })
    .catch((error) => {
      console.error("Unable to persist data.", error);
    });
  return saveQueue;
}

async function init() {
  ensureBackupButton();
  ensureStorageStatusChip();
  initFormOptions();
  bindEvents();
  await bootstrapData();
  await refreshStorageHealth();
  render();
}

function ensureBackupButton() {
  if (nodes.backupDataTrigger) return;
  const actions = document.querySelector(".topbar-actions");
  if (!actions) return;

  const button = document.createElement("button");
  button.id = "backup-data-trigger";
  button.className = "ghost-button";
  button.type = "button";
  button.textContent = "备份数据";

  actions.insertBefore(button, nodes.addBrandTrigger || nodes.addInfluencerTrigger || null);
  nodes.backupDataTrigger = button;
}

function ensureStorageStatusChip() {
  if (nodes.storageStatusChip || !nodes.topbarActions) return;
  const chip = document.createElement("span");
  chip.id = "storage-status-chip";
  chip.className = "storage-chip";
  chip.textContent = "连接中";
  nodes.topbarActions.insertBefore(chip, nodes.backupDataTrigger || nodes.addBrandTrigger || null);
  nodes.storageStatusChip = chip;
}

async function bootstrapData() {
  try {
    state.data = await fetchDataFromServer();
  } catch (error) {
    console.error("Unable to load shared data.", error);
    state.data = window.__APP_IMPORTED_DATA?.influencers?.length ? sanitizeData(window.__APP_IMPORTED_DATA) : createEmptyData();
  }
}

async function refreshStorageHealth() {
  try {
    const payload = await fetchStorageHealth();
    if (payload.storageMode === "cloud-supabase") {
      state.storage = {
        mode: "cloud-supabase",
        shared: true,
        label: "云端共享",
        hint: "当前是云端共享模式。多台电脑和手机访问同一个线上网址即可互通。",
      };
    } else if (payload.storageMode === "local-sqlite") {
      state.storage = {
        mode: "local-sqlite",
        shared: false,
        label: "本地模式",
        hint: `当前是本地 SQLite 模式。只有访问同一台主机 ${payload.localIp || "本机"} 的设备才互通。`,
      };
    } else if (payload.storageMode === "cloud-fallback-local") {
      state.storage = {
        mode: "cloud-fallback-local",
        shared: false,
        label: "云端异常，已切本地",
        hint: `云端暂时不可用，当前已回退到本地 SQLite 备份数据。当前主机 ${payload.localIp || "本机"} 仍可继续查看这批达人资料。`,
      };
    } else {
      state.storage = {
        mode: "unknown",
        shared: false,
        label: "模式未知",
        hint: "未识别当前存储模式，请检查后端状态。",
      };
    }
  } catch (error) {
    console.error("Unable to detect storage mode.", error);
    state.storage = {
      mode: "unknown",
      shared: false,
      label: "离线模式",
      hint: "当前无法确认后端状态，请检查服务是否正常运行。",
    };
  }

  applyStorageStatusUi();
}

function applyStorageStatusUi() {
  if (nodes.storageStatusChip) {
    nodes.storageStatusChip.textContent = state.storage.label;
    nodes.storageStatusChip.dataset.mode = state.storage.mode;
    nodes.storageStatusChip.title = state.storage.hint;
  }

  if (nodes.backupDataTrigger) {
    nodes.backupDataTrigger.textContent = state.storage.shared ? "导出快照" : "备份数据";
    nodes.backupDataTrigger.title = state.storage.shared
      ? "下载当前云端数据快照"
      : "在本机生成 SQLite + JSON 双备份";
  }

  if (nodes.sidebarNote) {
    const title = nodes.sidebarNote.querySelector(".sidebar-title");
    const paragraphs = nodes.sidebarNote.querySelectorAll("p");
    if (title) {
      title.textContent = state.storage.shared ? "云端共享状态" : "当前存储模式";
    }
    if (paragraphs[1]) {
      paragraphs[1].textContent = state.storage.hint;
    }
    if (paragraphs[2]) {
      paragraphs[2].textContent = state.storage.shared
        ? "现在这套更适合多电脑、多手机共同维护同一份达人资料。"
        : "如果要让两台不同电脑稳定互通，需要部署到 Vercel + Supabase。";
    }
  }
}

async function createLocalBackup() {
  const button = nodes.backupDataTrigger;
  const originalText = button?.textContent || "备份数据";

  if (button) {
    button.disabled = true;
    button.textContent = state.storage.shared ? "导出中..." : "备份中...";
  }

  try {
    await saveQueue.catch(() => undefined);

    if (state.storage.shared) {
      const latest = await fetchDataFromServer();
      downloadJsonSnapshot(latest);
      window.alert("云端快照已导出到浏览器下载目录。");
    } else {
      const payload = await requestLocalBackup();
      window.alert(
        `备份已完成。\n\n数据库备份：${payload.dbBackupPath}\nJSON 备份：${payload.jsonBackupPath}`,
      );
    }
  } catch (error) {
    console.error("Unable to create local backup.", error);
    window.alert("备份失败。请确认当前后端正在运行，或稍后重试。");
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}

function downloadJsonSnapshot(data) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const blob = new Blob(
    [
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          storageMode: state.storage.mode,
          data,
        },
        null,
        2,
      ),
    ],
    { type: "application/json;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `brandream-kol-hub-snapshot-${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function initFormOptions() {
  const platformSelect = nodes.influencerForm.elements.platform;
  const tierSelect = nodes.influencerForm.elements.followerTier;
  const prioritySelect = nodes.influencerForm.elements.priority;
  const statusSelect = nodes.influencerForm.elements.status;
  platformSelect.innerHTML = PLATFORMS.map((option) => `<option value="${option}">${option}</option>`).join("");
  tierSelect.innerHTML = [`<option value="">未设置</option>`]
    .concat(FOLLOWER_TIERS.map((option) => `<option value="${option}">${option}</option>`))
    .join("");
  prioritySelect.innerHTML = [`<option value="">未设置</option>`]
    .concat(PRIORITIES.map((option) => `<option value="${option}">${option}</option>`))
    .join("");
  statusSelect.innerHTML = STATUSES.map((option) => `<option value="${option}">${option}</option>`).join("");
}

function bindEvents() {
  nodes.navLinks.forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      render();
    });
  });

  nodes.globalSearch.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    render();
  });

  nodes.addInfluencerTrigger.addEventListener("click", openInfluencerModal);
  nodes.addBrandTrigger.addEventListener("click", openBrandModal);
  nodes.backupDataTrigger?.addEventListener("click", createLocalBackup);
  nodes.autofillTrigger.addEventListener("click", autofillInfluencerForm);

  nodes.influencerForm.addEventListener("submit", (event) => {
    const submitter = event.submitter?.value;
    if (submitter !== "save") {
      return;
    }

    event.preventDefault();
    saveInfluencerForm();
  });

  nodes.brandForm.addEventListener("submit", (event) => {
    const submitter = event.submitter?.value;
    if (submitter !== "save") {
      return;
    }

    event.preventDefault();
    saveBrandForm();
  });

  nodes.deleteForm.addEventListener("submit", (event) => {
    const submitter = event.submitter?.value;
    if (submitter !== "confirm") {
      return;
    }

    event.preventDefault();
    confirmSoftDelete();
  });

  nodes.bulkDeleteForm.addEventListener("submit", (event) => {
    const submitter = event.submitter?.value;
    if (submitter !== "confirm") {
      return;
    }

    event.preventDefault();
    confirmBulkSoftDelete();
  });

  nodes.timelineForm.addEventListener("submit", (event) => {
    const submitter = event.submitter?.value;
    if (submitter !== "save") {
      return;
    }

    event.preventDefault();
    saveTimelineEntry();
  });
}

function render() {
  renderNav();
  renderDashboard();
  renderInfluencers();
  renderBrands();
  renderReports();
  toggleView();
}

function renderNav() {
  const titles = {
    dashboard: { title: "Dashboard", eyebrow: "Overview" },
    influencers: { title: "达人库", eyebrow: "Influencer CRM" },
    brands: { title: "竞品品牌库", eyebrow: "Competitive Tracker" },
    reports: { title: "汇报导出", eyebrow: "Leadership Summary" },
  };

  nodes.navLinks.forEach((link) => link.classList.toggle("active", link.dataset.view === state.view));
  nodes.viewTitle.textContent = titles[state.view].title;
  nodes.viewEyebrow.textContent = titles[state.view].eyebrow;
  nodes.addBrandTrigger.style.display = state.view === "influencers" ? "none" : "inline-flex";
  nodes.addInfluencerTrigger.style.display = state.view === "brands" ? "none" : "inline-flex";
}

function toggleView() {
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.querySelector(`#${state.view}-view`).classList.add("active");
}

function getVisibleInfluencers() {
  const filters = state.filters;
  return state.data.influencers.filter((item) => {
    if (filters.deleted === "隐藏" && item.isDeleted) {
      return false;
    }

    if (filters.deleted === "仅看已删除" && !item.isDeleted) {
      return false;
    }

    if (filters.platform !== "全部" && item.platform !== filters.platform) {
      return false;
    }

    if (filters.country !== "全部" && item.country !== filters.country) {
      return false;
    }

    if (filters.contacted !== "全部") {
      const wanted = filters.contacted === "已联系";
      if (item.isContacted !== wanted) {
        return false;
      }
    }

    if (filters.status !== "全部" && item.status !== filters.status) {
      return false;
    }

    if (filters.priority !== "全部" && item.priority !== filters.priority) {
      return false;
    }

    if (filters.followerTier !== "全部" && item.followerTier !== filters.followerTier) {
      return false;
    }

    if (filters.report === "已加入" && !item.isSelectedForReport) {
      return false;
    }

    if (filters.report === "未加入" && item.isSelectedForReport) {
      return false;
    }

    if (!state.search) {
      return true;
    }

    const haystack = [
      item.accountHandle,
      item.displayName,
      item.country,
      item.contentType,
      item.bioKeywords,
      item.notes,
      item.recommendedProducts,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(state.search);
  });
}

function renderDashboard() {
  const influencers = state.data.influencers;
  const active = influencers.filter((item) => !item.isDeleted);
  const selected = active.filter((item) => item.isSelectedForReport);
  const recent = [...active].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
  const stats = [
    ["总达人", active.length],
    ["未联系", active.filter((item) => item.status === "未联系").length],
    ["已回复", active.filter((item) => item.status === "已回复沟通中").length],
    ["合作中", active.filter((item) => item.status === "合作进行中").length],
    ["已完成", active.filter((item) => item.status === "已完成").length],
    ["待汇报", selected.length],
  ];

  const platformCounts = PLATFORMS.map((platform) => ({
    platform,
    count: active.filter((item) => item.platform === platform).length,
  }));

  const statusCounts = STATUSES.map((status) => ({
    status,
    count: active.filter((item) => item.status === status).length,
  })).filter((item) => item.count > 0);

  nodes.dashboardView.innerHTML = `
    <div class="stats-grid">
      ${stats
        .map(
          ([label, value]) => `
            <article class="metric-card">
              <p class="eyebrow">${label}</p>
              <strong>${value}</strong>
            </article>
          `,
        )
        .join("")}
    </div>
    <div class="dashboard-panels">
      <section class="panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Platform Split</p>
            <h3 class="section-title">平台分布</h3>
          </div>
        </div>
        <div class="platform-pills">
          ${platformCounts
            .map(
              (item) => `
                <div class="pill">
                  <span>${item.platform}</span>
                  <strong>${item.count}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>
      <section class="panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Workflow</p>
            <h3 class="section-title">合作状态</h3>
          </div>
        </div>
        <div class="status-list">
          ${statusCounts
            .map(
              (item) => `
                <div class="tag">
                  <span>${item.status}</span>
                  <strong>${item.count}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>
      <section class="panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Latest</p>
            <h3 class="section-title">最近更新达人</h3>
          </div>
        </div>
        ${
          recent.length
            ? `<div class="stack">
            ${recent
              .map(
                (item) => `
                  <button class="link-button" data-open-influencer="${item.id}">
                    ${item.displayName} · ${item.platform} · ${item.status}
                  </button>
                `,
              )
              .join("")}
          </div>`
            : `<div class="empty-state">还没有达人数据。</div>`
        }
      </section>
      <section class="panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Brands</p>
            <h3 class="section-title">竞品品牌概览</h3>
          </div>
        </div>
        <p class="subtle">当前已记录 ${state.data.brands.length} 个竞品品牌，重点字段包含品类、价格带、母公司和来源。</p>
        <div class="platform-pills">
          ${topBrandCategories()
            .map(
              (item) => `
                <div class="pill">
                  <span>${item.label}</span>
                  <strong>${item.count}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>
    </div>
  `;

  bindOpenInfluencerButtons(nodes.dashboardView);
}

function topBrandCategories() {
  const map = new Map();
  state.data.brands.forEach((brand) => {
    const label = brand.category || "未分类";
    map.set(label, (map.get(label) || 0) + 1);
  });
  return [...map.entries()].map(([label, count]) => ({ label, count }));
}

function renderInfluencers() {
  const influencers = getVisibleInfluencers();
  const countries = uniqueValues(state.data.influencers.map((item) => item.country).filter(Boolean));

  nodes.influencersView.innerHTML = `
    <section class="table-card">
      <div class="toolbar">
        <div>
          <p class="eyebrow">Primary Workspace</p>
          <h3 class="section-title">达人库</h3>
          <p class="subtle">表格视图为主，可切换卡片查看封面和风格。</p>
        </div>
        <div class="view-toggle" role="tablist">
          <button class="${state.influencerViewMode === "table" ? "active" : ""}" data-mode="table">表格视图</button>
          <button class="${state.influencerViewMode === "card" ? "active" : ""}" data-mode="card">卡片视图</button>
        </div>
      </div>
      <div class="filters">
        ${renderSelectFilter("platform", ["全部", ...PLATFORMS], state.filters.platform, "平台")}
        ${renderSelectFilter("country", ["全部", ...countries], state.filters.country, "国家")}
        ${renderSelectFilter("contacted", ["全部", "已联系", "未联系"], state.filters.contacted, "是否联系")}
        ${renderSelectFilter("status", ["全部", ...STATUSES], state.filters.status, "合作状态")}
        ${renderSelectFilter("priority", ["全部", ...PRIORITIES], state.filters.priority, "优先级")}
        ${renderSelectFilter("followerTier", ["全部", ...FOLLOWER_TIERS], state.filters.followerTier, "粉丝级别")}
        ${renderSelectFilter("report", ["全部", "已加入", "未加入"], state.filters.report, "汇报名单")}
        ${renderSelectFilter("deleted", ["隐藏", "显示全部", "仅看已删除"], state.filters.deleted, "删除显示")}
      </div>
      ${
        state.influencerViewMode === "table"
          ? renderInfluencerTable(influencers)
          : renderInfluencerCards(influencers)
      }
      <div class="section-head" style="margin-top: 18px;">
        <p class="subtle">已勾选 ${state.selectedInfluencerIds.size} 位达人，可批量加入汇报或批量删除留痕。</p>
        <div class="inline-actions">
          <button class="ghost-button" id="batch-add-report">批量加入汇报名单</button>
          <button class="ghost-button" id="batch-remove-report">批量移出汇报名单</button>
          <button class="danger-button" id="batch-delete">批量删除留痕</button>
        </div>
      </div>
    </section>
    <section id="detail-host"></section>
  `;

  bindInfluencerViewEvents();
  renderInfluencerDetail();
}

function renderSelectFilter(key, options, value, label) {
  return `
    <label>
      ${label}
      <select data-filter="${key}">
        ${options.map((option) => `<option value="${option}" ${option === value ? "selected" : ""}>${option}</option>`).join("")}
      </select>
    </label>
  `;
}

function renderInfluencerTable(influencers) {
  if (!influencers.length) {
    return `<div class="empty-state">当前筛选下没有达人。</div>`;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th><input type="checkbox" id="select-all-influencers" /></th>
            <th>平台</th>
            <th>账号</th>
            <th>达人名称</th>
            <th>国家</th>
            <th>粉丝数</th>
            <th>粉丝级别</th>
            <th>是否联系</th>
            <th>合作状态</th>
            <th>优先级</th>
            <th>推荐产品</th>
            <th>最近更新</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${influencers
            .map(
              (item) => `
                <tr class="${item.isDeleted ? "deleted" : ""}">
                  <td><input type="checkbox" data-select-influencer="${item.id}" ${state.selectedInfluencerIds.has(item.id) ? "checked" : ""} /></td>
                  <td>${item.platform}</td>
                  <td>${item.accountHandle}</td>
                  <td>${item.displayName}</td>
                  <td>${item.country || "待补充"}</td>
                  <td>${formatNumber(item.followerCount)}</td>
                  <td>${item.followerTier || "未设置"}</td>
                  <td>
                    <select class="status-select compact-select" data-contacted="${item.id}">
                      <option value="false" ${!item.isContacted ? "selected" : ""}>未联系</option>
                      <option value="true" ${item.isContacted ? "selected" : ""}>已联系</option>
                    </select>
                  </td>
                  <td>
                    <select class="status-select" data-status="${item.id}">
                      ${STATUSES.map((status) => `<option value="${status}" ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}
                    </select>
                  </td>
                  <td>${item.priority || "-"}</td>
                  <td>${item.recommendedProducts || "-"}</td>
                  <td>${formatDate(item.updatedAt)}</td>
                  <td>
                    <div class="action-stack">
                      <button class="link-button" data-open-influencer="${item.id}">查看详情</button>
                      <button class="link-button" data-edit-influencer="${item.id}">编辑资料</button>
                      <button class="link-button" data-toggle-report="${item.id}">${item.isSelectedForReport ? "移出汇报" : "加入汇报"}</button>
                      <button class="link-button danger-text" data-delete-influencer="${item.id}">删除留痕</button>
                    </div>
                  </td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderInfluencerCards(influencers) {
  if (!influencers.length) {
    return `<div class="empty-state">当前筛选下没有达人。</div>`;
  }

  return `
    <div class="influencer-card-grid">
      ${influencers
        .map(
          (item) => `
            <article class="influencer-card ${item.isDeleted ? "deleted" : ""}">
              <div class="cover">
                ${renderCoverImage(item)}
              </div>
              <p class="eyebrow">${item.platform}</p>
              <h4 class="page-title">${item.displayName}</h4>
              <p class="subtle">${item.accountHandle} · ${item.country || "待补充"}</p>
              <div class="platform-pills">
                <span class="pill">${formatNumber(item.followerCount)}</span>
                <span class="pill">${item.followerTier || "未设置"}</span>
                <span class="pill">${item.status}</span>
              </div>
              <p>${item.fitReason || "暂无匹配理由"}</p>
              <div class="inline-actions">
                <button class="ghost-button small" data-open-influencer="${item.id}">查看详情</button>
                <button class="ghost-button small" data-edit-influencer="${item.id}">编辑资料</button>
                <button class="ghost-button small" data-toggle-report="${item.id}">${item.isSelectedForReport ? "移出汇报" : "加入汇报"}</button>
                <button class="ghost-button small" data-delete-influencer="${item.id}">删除留痕</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderInfluencerDetail() {
  const host = document.querySelector("#detail-host");
  const influencers = getVisibleInfluencers();
  if (!influencers.length) {
    host.innerHTML = "";
    return;
  }

  const active = influencers.find((item) => item.id === state.activeInfluencerId) || influencers[0];
  state.activeInfluencerId = active.id;

  host.innerHTML = `
    <div class="detail-layout">
      <section class="panel">
        <div class="detail-hero">
          <div class="cover detail-cover">${renderCoverImage(active)}</div>
          <div class="detail-sections">
            <div class="section-head">
              <div>
                <p class="eyebrow">${active.platform}</p>
                <h3 class="section-title">${active.displayName}</h3>
                <p class="subtle">${active.accountHandle} · ${active.country || "待补充国家"}</p>
              </div>
              <div class="inline-actions">
                <a class="ghost-button small" href="${active.profileUrl}" target="_blank" rel="noreferrer">打开主页</a>
                <button class="ghost-button small" data-edit-influencer="${active.id}">编辑达人</button>
                <button class="ghost-button small" data-toggle-report="${active.id}">${active.isSelectedForReport ? "移出汇报" : "加入汇报"}</button>
                <button class="danger-button small" data-delete-influencer="${active.id}">删除留痕</button>
              </div>
            </div>
            <div class="info-grid">
              ${renderInfoItem("粉丝数", formatNumber(active.followerCount))}
              ${renderInfoItem("粉丝级别", active.followerTier || "未设置")}
              ${renderInfoItem("是否联系", active.isContacted ? "已联系" : "未联系")}
              ${renderInfoItem("合作状态", active.status)}
              ${renderInfoItem("优先级", active.priority || "未设置")}
              ${renderInfoItem("自动填充", active.autoFillStatus || "未设置")}
              ${renderInfoItem("联系方式", active.contactInfo || "待补充")}
              ${renderInfoItem("推荐产品", active.recommendedProducts || "待补充")}
            </div>
            <div class="panel">
              <div class="section-head">
                <div>
                  <p class="eyebrow">Fit</p>
                  <h4 class="section-title">合作判断</h4>
                </div>
              </div>
              <p>${active.fitReason || "暂无匹配理由"}</p>
              <p class="subtle">内容类型：${active.contentType || "待补充"} · 简介关键词：${active.bioKeywords || "待补充"}</p>
            </div>
          </div>
        </div>
      </section>
      <section class="panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Screenshot Wall</p>
            <h3 class="section-title">截图资料墙</h3>
          </div>
        </div>
        ${renderGallery(active)}
      </section>
      <section class="panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Timeline</p>
            <h3 class="section-title">联系记录时间线</h3>
          </div>
        </div>
        <div class="timeline">
          ${active.logs
            .slice()
            .reverse()
            .map(
              (log) => `
                <article class="timeline-item">
                  <strong>${log.actionType}</strong>
                  <p>${log.actionNote}</p>
                  <p class="subtle">${formatDate(log.actionDate, true)}</p>
                </article>
              `,
            )
            .join("")}
        </div>
      </section>
    </div>
  `;

  ensureDetailEditButton(host, active.id);
  bindEditInfluencerButtons(host);
  bindOpenInfluencerButtons(host);
  bindDeleteButtons(host);
  bindReportButtons(host);
  bindUploadButtons(host, active.id);
}

function renderInfoItem(label, value) {
  return `
    <div class="info-item">
      <label>${label}</label>
      <div>${value}</div>
    </div>
  `;
}

function renderGallery(influencer) {
  const uploadId = `upload-${influencer.id}`;
  return `
    <div class="upload-box">
      <p class="subtle">支持上传主页截图、作品截图、审美参考图。</p>
      <input type="file" id="${uploadId}" data-upload="${influencer.id}" accept="image/*" multiple />
    </div>
    <div class="gallery">
      ${
        influencer.images.length
          ? influencer.images
              .map(
                (image) => `
                  <article class="gallery-item">
                    <div class="gallery-thumb">
                      ${image.imageData ? `<img alt="${image.title}" src="${image.imageData}" />` : `<span>${image.type}</span>`}
                    </div>
                    <div class="gallery-copy">
                      <strong>${image.title}</strong>
                      <p class="subtle">${image.type}</p>
                      <p>${image.note || "暂无备注"}</p>
                    </div>
                  </article>
                `,
              )
              .join("")
          : `<div class="empty-state">还没有截图，先上传一批参考图。</div>`
      }
    </div>
  `;
}

function renderBrands() {
  const query = state.search;
  const brands = state.data.brands.filter((brand) => {
    if (!query) return true;
    return [brand.brandName, brand.country, brand.category, brand.priceBand, brand.parentCompany, brand.notes]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  nodes.brandsView.innerHTML = `
    <section class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Competitor Tracking</p>
          <h3 class="section-title">竞品品牌库</h3>
        </div>
        <p class="subtle">已记录 ${brands.length} 个品牌，包含品类和价格带。</p>
      </div>
      <div class="brand-grid">
        ${
          brands.length
            ? brands
                .map(
                  (brand) => `
                    <article class="brand-card">
                      <p class="eyebrow">${brand.country || "未设置国家"}</p>
                      <h4 class="page-title">${brand.brandName}</h4>
                      <p>${brand.brandIntro || "暂无介绍"}</p>
                      <div class="brand-meta">
                        <span class="pill">品类：${brand.category || "未设置"}</span>
                        <span class="pill">价格带：${brand.priceBand || "未设置"}</span>
                        <span class="pill">母公司：${brand.parentCompany || "未设置"}</span>
                      </div>
                      <p class="subtle">发现来源：${brand.sourceNote || "待补充"} · 关联达人：${brand.relatedInfluencers || "待补充"}</p>
                      <div class="inline-actions">
                        <button class="ghost-button small" data-edit-brand="${brand.id}">编辑</button>
                        <button class="ghost-button small danger-text" data-delete-brand="${brand.id}">删除</button>
                        ${brand.websiteUrl ? `<a class="ghost-button small" href="${brand.websiteUrl}" target="_blank" rel="noreferrer">官网</a>` : ""}
                        ${brand.amazonUrl ? `<a class="ghost-button small" href="${brand.amazonUrl}" target="_blank" rel="noreferrer">Amazon</a>` : ""}
                      </div>
                    </article>
                  `,
                )
                .join("")
            : `<div class="empty-state">没有匹配的竞品品牌。</div>`
        }
      </div>
    </section>
  `;

  bindBrandActions();
}

function renderReports() {
  const selected = state.data.influencers.filter((item) => item.isSelectedForReport && !item.isDeleted);
  nodes.reportsView.innerHTML = `
    <section class="panel">
      <div class="report-toolbar">
        <div>
          <p class="eyebrow">Leadership Export</p>
          <h3 class="section-title">简介表格版汇报</h3>
          <p class="subtle">当前已选 ${selected.length} 位达人，可直接打印为 PDF。</p>
        </div>
        <div class="inline-actions">
          <button class="ghost-button" id="export-csv">导出 CSV</button>
          <button class="primary-button" id="print-report">打印 / 导出 PDF</button>
        </div>
      </div>
      <div class="report-card">
        <table>
          <thead>
            <tr>
              <th>达人名</th>
              <th>平台</th>
              <th>国家</th>
              <th>粉丝量</th>
              <th>状态</th>
              <th>推荐理由</th>
              <th>链接</th>
            </tr>
          </thead>
          <tbody>
            ${
              selected.length
                ? selected
                    .map(
                      (item) => `
                        <tr>
                          <td>${item.displayName}</td>
                          <td>${item.platform}</td>
                          <td>${item.country || "待补充"}</td>
                          <td>${formatNumber(item.followerCount)}</td>
                          <td>${item.status}</td>
                          <td>${item.fitReason || "-"}</td>
                          <td><a href="${item.profileUrl}" target="_blank" rel="noreferrer">${item.profileUrl}</a></td>
                        </tr>
                      `,
                    )
                    .join("")
                : `<tr><td colspan="7"><div class="empty-state">先在达人库勾选需要汇报的达人。</div></td></tr>`
            }
          </tbody>
        </table>
      </div>
    </section>
  `;

  document.querySelector("#print-report")?.addEventListener("click", () => window.print());
  document.querySelector("#export-csv")?.addEventListener("click", exportReportCsv);
}

function bindInfluencerViewEvents() {
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.influencerViewMode = button.dataset.mode;
      renderInfluencers();
    });
  });

  document.querySelectorAll("[data-filter]").forEach((select) => {
    select.addEventListener("change", (event) => {
      state.filters[event.target.dataset.filter] = event.target.value;
      renderInfluencers();
    });
  });

  document.querySelector("#select-all-influencers")?.addEventListener("change", (event) => {
    const visibleIds = getVisibleInfluencers().map((item) => item.id);
    if (event.target.checked) {
      visibleIds.forEach((id) => state.selectedInfluencerIds.add(id));
    } else {
      visibleIds.forEach((id) => state.selectedInfluencerIds.delete(id));
    }
    renderInfluencers();
  });

  document.querySelectorAll("[data-select-influencer]").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const id = event.target.dataset.selectInfluencer;
      if (event.target.checked) state.selectedInfluencerIds.add(id);
      else state.selectedInfluencerIds.delete(id);
    });
  });

  document.querySelectorAll("[data-contacted]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const item = state.data.influencers.find((row) => row.id === event.target.dataset.contacted);
      item.isContacted = event.target.value === "true";
      item.updatedAt = new Date().toISOString();
      item.logs.push(createLog("状态更新", `是否联系更新为：${item.isContacted ? "已联系" : "未联系"}`));
      saveData();
      renderInfluencers();
      renderReports();
      renderDashboard();
    });
  });

  document.querySelectorAll("[data-status]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const item = state.data.influencers.find((row) => row.id === event.target.dataset.status);
      item.status = event.target.value;
      item.updatedAt = new Date().toISOString();
      item.logs.push(createLog("状态更新", `合作状态更新为：${item.status}`));
      saveData();
      renderInfluencers();
      renderReports();
      renderDashboard();
    });
  });

  bindEditInfluencerButtons(nodes.influencersView);
  bindOpenInfluencerButtons(nodes.influencersView);
  bindDeleteButtons(nodes.influencersView);
  bindReportButtons(nodes.influencersView);
  document.querySelector("#batch-add-report")?.addEventListener("click", () => batchToggleReport(true));
  document.querySelector("#batch-remove-report")?.addEventListener("click", () => batchToggleReport(false));
  document.querySelector("#batch-delete")?.addEventListener("click", openBulkDeleteModal);
}

function bindEditInfluencerButtons(scope) {
  scope.querySelectorAll("[data-edit-influencer]").forEach((button) => {
    button.addEventListener("click", () => openInfluencerEditModal(button.dataset.editInfluencer));
  });
}

function ensureDetailEditButton(scope, influencerId) {
  const actionRow = scope.querySelector(".detail-hero .inline-actions");
  if (!actionRow || actionRow.querySelector("[data-edit-influencer]")) return;
  const markup = `<button class="ghost-button small" data-edit-influencer="${influencerId}">编辑达人</button>`;
  const toggleButton = actionRow.querySelector("[data-toggle-report]");
  if (toggleButton) {
    toggleButton.insertAdjacentHTML("beforebegin", markup);
    return;
  }
  actionRow.insertAdjacentHTML("afterbegin", markup);
}

function bindOpenInfluencerButtons(scope) {
  scope.querySelectorAll("[data-open-influencer]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeInfluencerId = button.dataset.openInfluencer;
      state.view = "influencers";
      render();
      document.querySelector("#detail-host")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function bindDeleteButtons(scope) {
  scope.querySelectorAll("[data-delete-influencer]").forEach((button) => {
    button.addEventListener("click", () => {
      state.deleteTargetId = button.dataset.deleteInfluencer;
      nodes.deleteForm.reset();
      nodes.deleteModal.showModal();
    });
  });
}

function bindReportButtons(scope) {
  scope.querySelectorAll("[data-toggle-report]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.data.influencers.find((row) => row.id === button.dataset.toggleReport);
      item.isSelectedForReport = !item.isSelectedForReport;
      item.updatedAt = new Date().toISOString();
      item.logs.push(createLog("汇报更新", item.isSelectedForReport ? "加入汇报名单" : "移出汇报名单"));
      saveData();
      render();
    });
  });
}

function bindUploadButtons(scope, influencerId) {
  scope.querySelectorAll("[data-upload]").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const files = [...event.target.files];
      if (!files.length) return;
      const influencer = state.data.influencers.find((item) => item.id === influencerId);
      for (const file of files) {
        const imageData = await fileToDataUrl(file);
        influencer.images.push({
          id: crypto.randomUUID(),
          type: "审美参考图",
          title: file.name,
          note: "上传截图",
          imageData,
        });
      }
      influencer.updatedAt = new Date().toISOString();
      influencer.logs.push(createLog("截图上传", `新增 ${files.length} 张截图`));
      saveData();
      renderInfluencers();
      renderDashboard();
    });
  });
}

function openInfluencerModal() {
  nodes.influencerForm.reset();
  state.editingInfluencerId = null;
  nodes.influencerForm.elements.platform.value = "Instagram";
  nodes.influencerForm.elements.priority.value = "A-";
  nodes.influencerForm.elements.status.value = STATUSES[0];
  nodes.influencerForm.elements.isContacted.value = "false";
  nodes.influencerForm.elements.isSelectedForReport.value = "false";
  nodes.influencerForm.elements.autoFillStatus.value = "";
  nodes.influencerForm.elements.avatarUrl.value = "";
  nodes.influencerModalEyebrow.textContent = "Add Influencer";
  nodes.influencerModalTitle.textContent = "新增达人";
  nodes.influencerSubmitLabel.textContent = "保存达人";
  nodes.autofillNote.textContent = "自动填充会根据链接识别平台、账号，并生成可编辑的基础资料。";
  nodes.influencerModal.showModal();
}

function openInfluencerEditModal(influencerId) {
  const influencer = state.data.influencers.find((item) => item.id === influencerId);
  if (!influencer) return;

  state.editingInfluencerId = influencerId;
  nodes.influencerForm.reset();
  const form = nodes.influencerForm.elements;
  form.platform.value = influencer.platform || "Instagram";
  form.profileUrl.value = influencer.profileUrl || "";
  form.accountHandle.value = influencer.accountHandle || "";
  form.displayName.value = influencer.displayName || "";
  form.country.value = influencer.country || "";
  form.followerCount.value = influencer.followerCount || "";
  form.followerTier.value = influencer.followerTier || "";
  form.contentType.value = influencer.contentType || "";
  form.bioKeywords.value = influencer.bioKeywords || "";
  form.contactInfo.value = influencer.contactInfo || "";
  form.firstContactChannel.value = influencer.firstContactChannel || "";
  form.quoteAmount.value = influencer.quoteAmount || "";
  form.priority.value = influencer.priority || "";
  form.status.value = influencer.status || STATUSES[0];
  form.isContacted.value = String(Boolean(influencer.isContacted));
  form.autoFillStatus.value = influencer.autoFillStatus || "";
  form.fitReason.value = influencer.fitReason || "";
  form.recommendedProducts.value = influencer.recommendedProducts || "";
  form.avatarUrl.value = influencer.avatarUrl || "";
  form.notes.value = influencer.notes || "";
  form.isSelectedForReport.value = String(Boolean(influencer.isSelectedForReport));

  nodes.influencerModalEyebrow.textContent = "Edit Influencer";
  nodes.influencerModalTitle.textContent = "编辑达人";
  nodes.influencerSubmitLabel.textContent = "保存修改";
  nodes.autofillNote.textContent = "你可以修改这位达人的全部主字段；保存后会直接覆盖当前档案。";
  nodes.influencerModal.showModal();
}

function openBrandModal() {
  nodes.brandForm.reset();
  state.editingBrandId = null;
  nodes.brandModal.showModal();
}

function openBrandEditModal(brandId) {
  const brand = state.data.brands.find((item) => item.id === brandId);
  if (!brand) return;
  state.editingBrandId = brandId;
  const form = nodes.brandForm.elements;
  form.brandName.value = brand.brandName || "";
  form.country.value = brand.country || "";
  form.category.value = brand.category || "";
  form.priceBand.value = brand.priceBand || "";
  form.brandIntro.value = brand.brandIntro || "";
  form.amazonUrl.value = brand.amazonUrl || "";
  form.websiteUrl.value = brand.websiteUrl || "";
  form.parentCompany.value = brand.parentCompany || "";
  form.sourceNote.value = brand.sourceNote || "";
  form.relatedInfluencers.value = brand.relatedInfluencers || "";
  form.notes.value = brand.notes || "";
  nodes.brandModal.showModal();
}

function autofillInfluencerForm() {
  const url = nodes.influencerForm.elements.profileUrl.value.trim();
  if (!url) {
    nodes.autofillNote.textContent = "请先输入达人链接。";
    return;
  }

  const guessed = guessInfluencerFromUrl(url, nodes.influencerForm.elements.platform.value);
  nodes.influencerForm.elements.platform.value = guessed.platform;
  nodes.influencerForm.elements.accountHandle.value = guessed.accountHandle;
  nodes.influencerForm.elements.displayName.value = guessed.displayName;
  nodes.influencerForm.elements.country.value = guessed.country;
  nodes.influencerForm.elements.followerCount.value = guessed.followerCount;
  nodes.influencerForm.elements.followerTier.value = guessed.followerTier;
  nodes.influencerForm.elements.contentType.value = guessed.contentType;
  nodes.influencerForm.elements.bioKeywords.value = guessed.bioKeywords;
  nodes.influencerForm.elements.autoFillStatus.value = "自动回填建议";
  nodes.influencerForm.elements.fitReason.value = guessed.fitReason;
  nodes.influencerForm.elements.recommendedProducts.value = guessed.recommendedProducts;
  nodes.autofillNote.textContent = "已根据链接自动回填基础资料，你可以继续手动修改。";
}

function guessInfluencerFromUrl(url, fallbackPlatform) {
  const lower = url.toLowerCase();
  const platform =
    lower.includes("tiktok")
      ? "TikTok"
      : lower.includes("instagram")
        ? "Instagram"
        : lower.includes("facebook")
          ? "Facebook"
          : lower.includes("pinterest")
            ? "Pinterest"
            : fallbackPlatform;
  const handlePart = url.split("/").filter(Boolean).pop()?.replace("@", "") || "newcreator";
  const accountHandle = `@${handlePart.replace(/[?#].*$/, "")}`;
  const title = handlePart
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
  const presets = {
    TikTok: {
      contentType: "Home finds / Cozy room / Short-form video",
      bioKeywords: "Home finds, cozy decor, bedding styling",
      recommendedProducts: "Twin XL bedding, quilt, dorm decor",
      fitReason: "短视频平台适合做宿舍、卧室改造和 Amazon 转化内容。",
    },
    Instagram: {
      contentType: "Bedroom styling / Lifestyle / Product photography",
      bioKeywords: "Bedroom aesthetic, home decor, cozy living",
      recommendedProducts: "Floral duvet cover, cottage bedding, quilt",
      fitReason: "Instagram 适合沉淀主页审美和卧室氛围内容。",
    },
    Facebook: {
      contentType: "Home inspiration / Community content",
      bioKeywords: "Home styling, room ideas, decor inspiration",
      recommendedProducts: "Quilt, floral sheet set, comforter set",
      fitReason: "Facebook 更适合社群传播和中长链路种草。",
    },
    Pinterest: {
      contentType: "Moodboard / Home inspiration / Search content",
      bioKeywords: "Moodboard, bedroom aesthetic, cottage room ideas",
      recommendedProducts: "Pretty bedding, floral room, bedroom refresh",
      fitReason: "Pinterest 适合沉淀审美参考图和关键词导向内容。",
    },
  };
  const preset = presets[platform];
  const followerCount = Math.floor(12000 + Math.random() * 180000);

  return {
    platform,
    accountHandle,
    displayName: title || "New Creator",
    country: "待确认",
    followerCount,
    followerTier: deriveTier(followerCount),
    contentType: preset.contentType,
    bioKeywords: preset.bioKeywords,
    fitReason: preset.fitReason,
    recommendedProducts: preset.recommendedProducts,
  };
}

function deriveTier(count) {
  if (count < 10000) return "Nano";
  if (count < 50000) return "Micro";
  if (count < 150000) return "Mid-tier";
  if (count < 500000) return "Macro";
  return "Mega";
}

function saveInfluencerForm() {
  const form = nodes.influencerForm.elements;
  const now = new Date().toISOString();
  const payload = {
    platform: form.platform.value,
    accountHandle: form.accountHandle.value.trim() || "@newcreator",
    displayName: form.displayName.value.trim() || "New Creator",
    profileUrl: form.profileUrl.value.trim(),
    country: form.country.value.trim(),
    followerCount: Number(form.followerCount.value) || 0,
    followerTier: form.followerTier.value || deriveTier(Number(form.followerCount.value) || 0),
    contentType: form.contentType.value.trim(),
    bioKeywords: form.bioKeywords.value.trim(),
    avatarUrl: form.avatarUrl.value.trim(),
    autoFillStatus: form.autoFillStatus.value.trim(),
    fitReason: form.fitReason.value.trim(),
    recommendedProducts: form.recommendedProducts.value.trim(),
    contactInfo: form.contactInfo.value.trim(),
    priority: form.priority.value || "A-",
    status: form.status.value || STATUSES[0],
    isContacted: form.isContacted.value === "true",
    firstContactChannel: form.firstContactChannel.value.trim(),
    quoteAmount: form.quoteAmount.value.trim(),
    notes: form.notes.value.trim(),
    isSelectedForReport: form.isSelectedForReport.value === "true",
  };

  if (state.editingInfluencerId) {
    const influencer = state.data.influencers.find((item) => item.id === state.editingInfluencerId);
    if (!influencer) return;
    Object.assign(influencer, payload, { updatedAt: now });
    influencer.logs ??= [];
    influencer.logs.push(createLog("资料更新", "手动编辑达人主资料", now));
    state.activeInfluencerId = influencer.id;
  } else {
    const item = {
      id: crypto.randomUUID(),
      ...payload,
      images: [],
      logs: [
        createLog("新增", "创建达人档案", now),
        createLog("自动回填", "根据链接识别账号、平台和基础资料", now),
      ],
      isDeleted: false,
      deletedAt: "",
      deletionReason: "",
      createdAt: now,
      updatedAt: now,
    };
    state.data.influencers.unshift(item);
    state.activeInfluencerId = item.id;
  }

  saveData();
  nodes.influencerModal.close();
  state.editingInfluencerId = null;
  state.view = "influencers";
  render();
}

function saveBrandForm() {
  const form = nodes.brandForm.elements;
  const payload = {
    brandName: form.brandName.value.trim(),
    country: form.country.value.trim(),
    category: form.category.value.trim(),
    priceBand: form.priceBand.value.trim(),
    brandIntro: form.brandIntro.value.trim(),
    amazonUrl: form.amazonUrl.value.trim(),
    websiteUrl: form.websiteUrl.value.trim(),
    parentCompany: form.parentCompany.value.trim(),
    sourceNote: form.sourceNote.value.trim(),
    relatedInfluencers: form.relatedInfluencers.value.trim(),
    notes: form.notes.value.trim(),
  };

  if (state.editingBrandId) {
    const brand = state.data.brands.find((item) => item.id === state.editingBrandId);
    Object.assign(brand, payload);
  } else {
    state.data.brands.unshift({
      id: crypto.randomUUID(),
      ...payload,
    });
  }
  saveData();
  nodes.brandModal.close();
  state.editingBrandId = null;
  renderBrands();
  renderDashboard();
}

function bindBrandActions() {
  document.querySelectorAll("[data-edit-brand]").forEach((button) => {
    button.addEventListener("click", () => openBrandEditModal(button.dataset.editBrand));
  });

  document.querySelectorAll("[data-delete-brand]").forEach((button) => {
    button.addEventListener("click", () => {
      const brandId = button.dataset.deleteBrand;
      const brand = state.data.brands.find((item) => item.id === brandId);
      if (!brand) return;
      const confirmed = window.confirm(`确认删除竞品品牌“${brand.brandName}”吗？`);
      if (!confirmed) return;
      state.data.brands = state.data.brands.filter((item) => item.id !== brandId);
      saveData();
      renderBrands();
      renderDashboard();
    });
  });
}

function confirmSoftDelete() {
  const influencer = state.data.influencers.find((item) => item.id === state.deleteTargetId);
  if (!influencer) return;
  const reason = nodes.deleteForm.elements.deletionReason.value.trim() || "未填写原因";
  influencer.isDeleted = true;
  influencer.deletedAt = new Date().toISOString();
  influencer.deletionReason = reason;
  influencer.status = "不合作";
  influencer.updatedAt = new Date().toISOString();
  influencer.logs.push(createLog("删除", `删除留痕：${reason}`));
  saveData();
  nodes.deleteModal.close();
  render();
}

function openBulkDeleteModal() {
  if (!state.selectedInfluencerIds.size) {
    return;
  }
  nodes.bulkDeleteForm.reset();
  nodes.bulkDeleteModal.showModal();
}

function confirmBulkSoftDelete() {
  if (!state.selectedInfluencerIds.size) return;
  const reason = nodes.bulkDeleteForm.elements.deletionReason.value.trim() || "未填写原因";
  const now = new Date().toISOString();
  state.data.influencers.forEach((influencer) => {
    if (!state.selectedInfluencerIds.has(influencer.id)) return;
    influencer.isDeleted = true;
    influencer.deletedAt = now;
    influencer.deletionReason = reason;
    influencer.status = "不合作";
    influencer.updatedAt = now;
    influencer.logs.push(createLog("删除", `批量删除留痕：${reason}`));
  });
  state.selectedInfluencerIds.clear();
  saveData();
  nodes.bulkDeleteModal.close();
  render();
}

function batchToggleReport(enabled) {
  if (!state.selectedInfluencerIds.size) return;
  const now = new Date().toISOString();
  state.data.influencers.forEach((influencer) => {
    if (!state.selectedInfluencerIds.has(influencer.id)) return;
    influencer.isSelectedForReport = enabled;
    influencer.updatedAt = now;
    influencer.logs.push(createLog("汇报更新", enabled ? "批量加入汇报名单" : "批量移出汇报名单", now));
  });
  saveData();
  render();
}

function exportReportCsv() {
  const selected = state.data.influencers.filter((item) => item.isSelectedForReport && !item.isDeleted);
  const rows = [
    ["达人名", "平台", "国家", "粉丝量", "状态", "推荐理由", "链接"],
    ...selected.map((item) => [
      item.displayName,
      item.platform,
      item.country,
      String(item.followerCount),
      item.status,
      item.fitReason,
      item.profileUrl,
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "brandream-kol-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function uniqueValues(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function renderCoverImage(item) {
  const image = item.images.find((entry) => entry.imageData) || item.images[0];
  if (image?.imageData) {
    return `<img src="${image.imageData}" alt="${item.displayName}" />`;
  }
  return `<span>${item.displayName}</span>`;
}

function formatNumber(value) {
  if (!value) return "0";
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value, withTime = false) {
  if (!value) return "待更新";
  const date = new Date(value);
  return withTime
    ? new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    : new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function renderInfluencerDetail() {
  const host = document.querySelector("#detail-host");
  const influencers = getVisibleInfluencers();
  if (!influencers.length) {
    host.innerHTML = "";
    return;
  }

  const active = influencers.find((item) => item.id === state.activeInfluencerId) || influencers[0];
  state.activeInfluencerId = active.id;

  host.innerHTML = `
    <div class="detail-layout">
      <section class="panel">
        <div class="detail-hero">
          <div class="cover detail-cover">${renderCoverImage(active)}</div>
          <div class="detail-sections">
            <div class="section-head">
              <div>
                <p class="eyebrow">${active.platform}</p>
                <h3 class="section-title">${active.displayName}</h3>
                <p class="subtle">${active.accountHandle} · ${active.country || "待补充国家"}</p>
              </div>
              <div class="inline-actions">
                <a class="ghost-button small" href="${active.profileUrl}" target="_blank" rel="noreferrer">打开主页</a>
                <button class="ghost-button small" data-toggle-report="${active.id}">${active.isSelectedForReport ? "移出汇报" : "加入汇报"}</button>
                <button class="danger-button small" data-delete-influencer="${active.id}">删除留痕</button>
              </div>
            </div>
            <div class="info-grid">
              ${renderInfoItem("粉丝数", formatNumber(active.followerCount))}
              ${renderInfoItem("粉丝级别", active.followerTier || "未设置")}
              ${renderInfoItem("是否联系", active.isContacted ? "已联系" : "未联系")}
              ${renderInfoItem("合作状态", active.status)}
              ${renderInfoItem("优先级", active.priority || "未设置")}
              ${renderInfoItem("自动填充", active.autoFillStatus || "未设置")}
              ${renderInfoItem("联系方式", active.contactInfo || "待补充")}
              ${renderInfoItem("推荐产品", active.recommendedProducts || "待补充")}
            </div>
            <div class="panel">
              <div class="section-head">
                <div>
                  <p class="eyebrow">Fit</p>
                  <h4 class="section-title">合作判断</h4>
                </div>
              </div>
              <p>${active.fitReason || "暂无匹配理由"}</p>
              <p class="subtle">内容类型：${active.contentType || "待补充"} · 简介关键词：${active.bioKeywords || "待补充"}</p>
            </div>
          </div>
        </div>
      </section>
      <section class="panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Supplementary Info</p>
            <h3 class="section-title">补充资料</h3>
          </div>
          <div class="detail-tabs">
            <button class="${state.detailTab === "overview" ? "active" : ""}" data-detail-tab="overview">基础资料</button>
            <button class="${state.detailTab === "media" ? "active" : ""}" data-detail-tab="media">截图资料</button>
            <button class="${state.detailTab === "timeline" ? "active" : ""}" data-detail-tab="timeline">联系记录时间线</button>
          </div>
        </div>
        <div class="detail-subpanel">
          ${renderDetailSubpanel(active)}
        </div>
      </section>
    </div>
  `;

  ensureDetailEditButton(host, active.id);
  bindEditInfluencerButtons(host);
  bindOpenInfluencerButtons(host);
  bindDeleteButtons(host);
  bindReportButtons(host);
  bindUploadButtons(host, active.id);
  bindDetailTabButtons(host);
  bindAvatarActions(host, active.id);
  bindTimelineActions(host, active.id);
}

function renderDetailSubpanel(active) {
  if (state.detailTab === "media") {
    return renderGallery(active);
  }

  if (state.detailTab === "timeline") {
    return renderTimelinePanel(active);
  }

  return renderOverviewPanel(active);
}

function renderOverviewPanel(active) {
  return `
    <div class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Avatar</p>
          <h4 class="section-title">达人头像</h4>
        </div>
      </div>
      <div class="avatar-actions">
        <button class="ghost-button small" data-generate-avatar="${active.id}">自动生成头像</button>
        <label class="ghost-button small" style="display:inline-flex;align-items:center;">
          上传头像
          <input type="file" data-avatar-upload="${active.id}" accept="image/*" style="display:none;" />
        </label>
      </div>
      <div class="avatar-url-row">
        <input type="url" data-avatar-url="${active.id}" placeholder="手动输入头像图片链接" value="${active.avatarUrl || ""}" />
        <button class="primary-button small" data-save-avatar-url="${active.id}">保存头像</button>
      </div>
      <p class="helper-text">如果平台头像不能自动抓取，可以手动上传头像或输入图片链接。</p>
    </div>
    <div class="panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Core Info</p>
          <h4 class="section-title">基础资料摘要</h4>
        </div>
      </div>
      <div class="info-grid">
        ${renderInfoItem("主页链接", active.profileUrl || "待补充")}
        ${renderInfoItem("联系渠道", active.firstContactChannel || "待补充")}
        ${renderInfoItem("报价", active.quoteAmount || "待补充")}
        ${renderInfoItem("备注", active.notes || "待补充")}
      </div>
    </div>
  `;
}

function renderTimelinePanel(active) {
  return `
    <div class="toolbar-slim">
      <p class="subtle">时间线会自动记录新增达人、自动回填、状态更新、截图上传、删除等动作，你也可以手动补录并指定发生时间。</p>
      <button class="primary-button small" data-add-timeline="${active.id}">新增时间线记录</button>
    </div>
    <div class="timeline">
      ${active.logs
        .slice()
        .sort((a, b) => new Date(b.actionDate || 0) - new Date(a.actionDate || 0))
        .map(
          (log) => `
            <article class="timeline-item">
              <strong>${log.actionType}</strong>
              <p>${log.actionNote}</p>
              <p class="subtle">${formatDate(log.actionDate, true)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function bindDetailTabButtons(scope) {
  scope.querySelectorAll("[data-detail-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.detailTab = button.dataset.detailTab;
      renderInfluencerDetail();
    });
  });
}

function bindAvatarActions(scope, influencerId) {
  scope.querySelector("[data-generate-avatar]")?.addEventListener("click", () => {
    const influencer = state.data.influencers.find((item) => item.id === influencerId);
    if (!influencer) return;
    influencer.avatarUrl = createAvatarDataUri(influencer.displayName);
    influencer.updatedAt = new Date().toISOString();
    influencer.logs.push(createLog("头像更新", "自动生成达人头像"));
    saveData();
    renderInfluencerDetail();
  });

  scope.querySelector("[data-save-avatar-url]")?.addEventListener("click", () => {
    const influencer = state.data.influencers.find((item) => item.id === influencerId);
    const input = scope.querySelector("[data-avatar-url]");
    if (!influencer || !input) return;
    influencer.avatarUrl = input.value.trim();
    influencer.updatedAt = new Date().toISOString();
    influencer.logs.push(createLog("头像更新", "手动保存头像链接"));
    saveData();
    renderInfluencerDetail();
  });

  scope.querySelector("[data-avatar-upload]")?.addEventListener("change", async (event) => {
    const influencer = state.data.influencers.find((item) => item.id === influencerId);
    const file = event.target.files?.[0];
    if (!influencer || !file) return;
    influencer.avatarUrl = await fileToDataUrl(file);
    influencer.updatedAt = new Date().toISOString();
    influencer.logs.push(createLog("头像更新", "手动上传达人头像"));
    saveData();
    renderInfluencerDetail();
  });
}

function bindTimelineActions(scope, influencerId) {
  scope.querySelector("[data-add-timeline]")?.addEventListener("click", () => {
    state.timelineTargetId = influencerId;
    nodes.timelineForm.reset();
    nodes.timelineForm.elements.actionDate.value = toDatetimeLocalValue(new Date().toISOString());
    nodes.timelineModal.showModal();
  });
}

function saveTimelineEntry() {
  const influencer = state.data.influencers.find((item) => item.id === state.timelineTargetId);
  if (!influencer) return;
  const form = nodes.timelineForm.elements;
  const actionDate = form.actionDate.value ? new Date(form.actionDate.value).toISOString() : new Date().toISOString();
  influencer.logs.push(createLog(form.actionType.value, form.actionNote.value.trim() || "手动补录时间线", actionDate));
  influencer.updatedAt = new Date().toISOString();
  saveData();
  nodes.timelineModal.close();
  state.detailTab = "timeline";
  renderInfluencerDetail();
}

function renderCoverImage(item) {
  if (item.avatarUrl) {
    return `<img class="avatar-thumb" src="${item.avatarUrl}" alt="${item.displayName}" />`;
  }
  const image = item.images.find((entry) => entry.imageData) || item.images[0];
  if (image?.imageData) {
    return `<img src="${image.imageData}" alt="${item.displayName}" />`;
  }
  return `<span>${item.displayName}</span>`;
}

function createAvatarDataUri(name) {
  const initials = (name || "KOL")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
  const safeInitials = initials || "K";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#1f5a52"/><rect x="24" y="24" width="352" height="352" rx="44" fill="#c48537" opacity="0.28"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="Georgia, serif" font-size="140" fill="#fffdf8">${safeInitials}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function toDatetimeLocalValue(isoString) {
  const date = new Date(isoString);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function renderInfluencers() {
  const influencers = getVisibleInfluencers();
  const countries = uniqueValues(state.data.influencers.map((item) => item.country).filter(Boolean));

  nodes.influencersView.innerHTML = `
    <div class="workspace-layout">
      <section class="table-card workspace-main">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Primary Workspace</p>
            <h3 class="section-title">达人库</h3>
            <p class="subtle">点“查看详情”后，右侧会直接显示这个达人的完整详情页，以及它内部的基础资料、截图资料、联系记录时间线子分支。</p>
          </div>
          <div class="view-toggle" role="tablist">
            <button class="${state.influencerViewMode === "table" ? "active" : ""}" data-mode="table">表格视图</button>
            <button class="${state.influencerViewMode === "card" ? "active" : ""}" data-mode="card">卡片视图</button>
          </div>
        </div>
        <div class="filters">
          ${renderSelectFilter("platform", ["全部", ...PLATFORMS], state.filters.platform, "平台")}
          ${renderSelectFilter("country", ["全部", ...countries], state.filters.country, "国家")}
          ${renderSelectFilter("contacted", ["全部", "已联系", "未联系"], state.filters.contacted, "是否联系")}
          ${renderSelectFilter("status", ["全部", ...STATUSES], state.filters.status, "合作状态")}
          ${renderSelectFilter("priority", ["全部", ...PRIORITIES], state.filters.priority, "优先级")}
          ${renderSelectFilter("followerTier", ["全部", ...FOLLOWER_TIERS], state.filters.followerTier, "粉丝级别")}
          ${renderSelectFilter("report", ["全部", "已加入", "未加入"], state.filters.report, "汇报名单")}
          ${renderSelectFilter("deleted", ["隐藏", "显示全部", "仅看已删除"], state.filters.deleted, "删除显示")}
        </div>
        ${
          state.influencerViewMode === "table"
            ? renderInfluencerTable(influencers)
            : renderInfluencerCards(influencers)
        }
        <div class="section-head" style="margin-top: 18px;">
          <p class="subtle">已勾选 ${state.selectedInfluencerIds.size} 位达人，可批量加入汇报或批量删除留痕。</p>
          <div class="inline-actions">
            <button class="ghost-button" id="batch-add-report">批量加入汇报名单</button>
            <button class="ghost-button" id="batch-remove-report">批量移出汇报名单</button>
            <button class="danger-button" id="batch-delete">批量删除留痕</button>
          </div>
        </div>
      </section>
      <aside id="detail-host" class="workspace-side"></aside>
    </div>
  `;

  bindInfluencerViewEvents();
  renderInfluencerDetail();
}

init();
