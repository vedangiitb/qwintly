export const pmContext = {
  capabilities: {
    supported_task_types: ["ui_task", "be_task", "db_task"],

    ui_task_intents: [
      "add_page",
      "add_section",
      "modify_section",
      "modify_text_content",
      "modify_styling",
    ],

    be_task_intents: [
      "add_new_service",
      "modify_service",
      "connect_ai",
      "db_connection",
    ],

    db_task_intents: [
      "add_new_table",
      "modify_schema",
      "modify_table",
      "add_new_column",
      "modify_column",
    ],
    unsupported_capabilities: ["payments"],
  },

  project_info: {
    product: {
      name: "Template",
      description:
        "The project currently hasn't started and has only template with landing page",
      role: "Not yet decided",
      target_users: "Not yet decided",
    },
    current_project_summary: {
      project_type: "Not yet decided",
      framework: "Next.js",
      styling: "Tailwind CSS",
      pages: [
        {
          route: "/",
          name: "landing",
          description: "Landing page",
          features: [],
        },
      ],
      ui_features: {},
      be_features: {},
      db_features: {},
    },

    config_summary: {
      db_connected: false,
      ai_connected: false,
      auth_connected: false,
    },
  },

  guidelines: {
    design_guidelines: {
      tone: "friendly",
      layout_style: "simple",
      mobile_first: true,
    },

    known_constraints: [
      "Do not remove existing features unless user explicitly asks",
      "Prefer adding over replacing",
      "Keep sections vertically stacked",
    ],
  },
};
