package config

import (
	_ "embed"
)

//go:embed multi_agent_system_core_rules.md
var MultiAgentSystemCoreRules string

//go:embed multi_agent_system_prologue_rules.md
var MultiAgentSystemPrologueRules string

//go:embed system_core_rules.md
var SystemCoreRules string

//go:embed system_prologue_rules.md
var SystemPrologueRules string

//go:embed system_summary_rules.md
var SystemSummaryRules string
