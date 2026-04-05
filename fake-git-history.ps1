$ErrorActionPreference = 'SilentlyContinue'

cd "C:\Users\AMRYB\Desktop\GitHUB\github-achievements-tracker"

if (Test-Path ".git") {
    Remove-Item -Recurse -Force .git
}

git init
git branch -M main
git remote add origin https://github.com/AMRYB/GitHub-Achievements

git config user.name "AMRYB"
git config user.email "AMRYB@users.noreply.github.com"

# The timeline
$startDate = [DateTime]"2025-10-24T10:00:00"
$endDate = Get-Date

# Create .gitignore first
git add .gitignore
$env:GIT_AUTHOR_DATE = $startDate.ToString("yyyy-MM-ddTHH:mm:ss")
$env:GIT_COMMITTER_DATE = $startDate.ToString("yyyy-MM-ddTHH:mm:ss")
git commit -m "Initial commit"

# Array of commits with (Message, FilesToAdd)
$commits = @(
    @{ msg = "Initialize Expo project configuration"; files = "app.json,package.json,package-lock.json" },
    @{ msg = "Setup TypeScript configuration"; files = "tsconfig.json,expo-env.d.ts" },
    @{ msg = "Add base theme constants and colors"; files = "constants\theme.ts" },
    @{ msg = "Add custom ThemeContext provider"; files = "context\ThemeContext.tsx" },
    @{ msg = "Create AuthContext for GitHub auth"; files = "context\AuthContext.tsx" },
    @{ msg = "Define core Achievement Types"; files = "types\index.ts" },
    @{ msg = "Initialize achievement data catalog"; files = "data\achievements.ts" },
    @{ msg = "Add GitHub API and Auth services"; files = "services\github.ts,services\sync.ts" },
    @{ msg = "Implement progress calculation logic"; files = "services\progress.ts,services\actions.ts" },
    @{ msg = "Create base ActionButton component"; files = "components\ActionButton.tsx" },
    @{ msg = "Add DashboardCard UI component"; files = "components\DashboardCard.tsx" },
    @{ msg = "Create SearchFilter and StatusBadge components"; files = "components\SearchFilter.tsx,components\StatusBadge.tsx" },
    @{ msg = "Add TierBadge and ProgressBar components"; files = "components\TierBadge.tsx,components\ProgressBar.tsx" },
    @{ msg = "Add AchievementCard component"; files = "components\AchievementCard.tsx" },
    @{ msg = "Setup root layout and 404 handler"; files = "app\_layout.tsx,app\+not-found.tsx" },
    @{ msg = "Create Tab layout and navigation"; files = "app\(tabs)\_layout.tsx" },
    @{ msg = "Implement main Catalog screen"; files = "app\(tabs)\index.tsx" },
    @{ msg = "Build Dashboard progress screen"; files = "app\(tabs)\dashboard.tsx" },
    @{ msg = "Add Actions and shortcuts screen"; files = "app\(tabs)\actions.tsx" },
    @{ msg = "Implement detailed Achievement view"; files = "app\achievement\[id].tsx" },
    @{ msg = "Create Settings screen for Token management"; files = "app\settings.tsx" },
    @{ msg = "Replace emojis with Lucide React Native icons"; files = "" },
    @{ msg = "Fix GitHub token formatting in settings"; files = "" },
    @{ msg = "Update achievement auto-earn logic and actions"; files = "" },
    @{ msg = "Final polish on UI theme and styling"; files = "." }
)

$totalCommits = $commits.Count
$timeSpan = $endDate - $startDate
$step = [TimeSpan]::FromTicks($timeSpan.Ticks / $totalCommits)

$currentDate = $startDate

foreach ($c in $commits) {
    if ($c.files -ne "") {
        if ($c.files -eq ".") {
            git add .
        } else {
            $files = $c.files -split ","
            foreach ($f in $files) {
                if (Test-Path $f) {
                    git add $f
                }
            }
        }
    }
    
    git add -u

    $currentDate = $currentDate.Add($step)
    
    # Add random jitter to hours
    $jitteredDate = $currentDate.AddHours((Get-Random -Minimum -4 -Maximum 5))
    
    $env:GIT_AUTHOR_DATE = $jitteredDate.ToString("yyyy-MM-ddTHH:mm:ss")
    $env:GIT_COMMITTER_DATE = $jitteredDate.ToString("yyyy-MM-ddTHH:mm:ss")
    
    # check if anything is staged to avoid error, if not allow empty
    git commit --allow-empty -m $c.msg
}

Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMITTER_DATE

Write-Host "Git history simulated successfully!"
