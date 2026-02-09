package config

import (
	_ "embed"
)

//go:embed system_core_rules.md
var SystemCoreRules string

//go:embed system_prologue_rules.md
var SystemPrologueRules string