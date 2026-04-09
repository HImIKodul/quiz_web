$TaskName = "QuizAppWeb"
$ActionScript = "C:\quiz_app\launch_web.bat"

# Create the action
$Action = New-ScheduledTaskAction -Execute $ActionScript -WorkingDirectory "C:\quiz_app"

# Create the trigger (At system startup)
$Trigger = New-ScheduledTaskTrigger -AtStartup

# Create the settings (Restart if failed)
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

# Register the task
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -User "SYSTEM" -RunLevel Highest -Force

Write-Host "Scheduled task $TaskName registered successfully."
