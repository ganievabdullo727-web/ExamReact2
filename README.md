# TaskFlow

TaskFlow барои идора кардани лоиҳаҳо ва вазифаҳои гурӯҳӣ истифода мешавад. Фронтенд дар `my-app/` ҷойгир аст ва ба backend тавассути API-и `/api/v1` пайваст мешавад.

## Чӣ тавр сайтро кушоем

1. [Backend](https://github.com/Amsurur/task-management-backend)-ро дар порти **3000** ба кор дароред. [Swagger](http://127.0.0.1:3000/docs/) ва [санҷиши кори backend](http://127.0.0.1:3000/health) дар ҳамин порт ҳастанд.
2. Аз ҷузвдони асосии репозиторий бо Node.js **20.9 ё навтар** фармонҳои зеринро иҷро кунед.

```bash
cd my-app
npm ci
npm run dev -- --port 3001
```

3. [Саҳифаи воридшавӣ](http://localhost:3001/login) ё [рӯйхати Workspaces](http://localhost:3001/workspaces)-ро кушоед. Суроғаи backend дар [клиенти Axios](./my-app/src/shared/api/client.ts) танзим шудааст.

## Бахшҳо ва файлҳои онҳо

Дар Swagger **14 бахши асосӣ ва 74 амалиёти API** ҳаст. Фронтенд барои ҳамаи 74 амалиёт дархост дорад. Аз 77 амалиёти Swagger се адади дигар техникӣ ҳастанд — `/health` ва ду амалиёти анбори файл.

**9 бахш аз рӯи ҷараёнҳои асосии фронтенд анҷом шудаанд.** Панҷ бахши дигар пайвастанд ва корҳои боқимондаашон дар поён шарҳ дода шудаанд. Бахши тамоман оғознашуда нест. Линкҳои **UI** файли экран ва линкҳои **API** файли дархостҳои ҳамон бахшро мекушоянд.

| Бахш | API | Дар сайт аз куҷо кушоем | Файлҳои фронтенд | Ҳолат |
| --- | ---: | --- | --- | --- |
| Auth ва Profile | 7 | Login, Register, Profile | [Login](./my-app/src/features/auth/components/LoginForm.tsx), [Register](./my-app/src/features/auth/components/RegisterForm.tsx), [Profile](./my-app/src/features/auth/components/ProfileForms.tsx), [API](./my-app/src/features/auth/api/auth.api.ts) | Пайваст, [камбудиҳо](#auth) |
| Workspaces | 12 | Workspaces → як workspace → Settings ё Members | [Рӯйхат](./my-app/src/features/workspaces/components/WorkspaceList.tsx), [Settings](./my-app/src/features/workspaces/components/WorkspaceSettings.tsx), [Members](./my-app/src/features/workspaces/components/WorkspaceMembers.tsx), [API](./my-app/src/features/workspaces/api/workspace.api.ts) | Анҷом |
| Projects | 8 | Workspace → Projects → як project → Settings ё Members | [Рӯйхат](./my-app/src/features/projects/components/ProjectList.tsx), [Экрани project](./my-app/src/features/projects/components/ProjectScreen.tsx), [Settings](./my-app/src/features/projects/components/ProjectSettings.tsx), [Members](./my-app/src/features/projects/components/ProjectMembers.tsx), [API](./my-app/src/features/projects/api/project.api.ts) | Анҷом |
| States | 4 | Project → Settings → States | [UI](./my-app/src/features/projects/states/components/ProjectStates.tsx), [API](./my-app/src/features/projects/states/api/state.api.ts) | Анҷом |
| Labels | 4 | Project → Settings → Labels | [UI](./my-app/src/features/projects/labels/components/ProjectLabels.tsx), [API](./my-app/src/features/projects/labels/api/label.api.ts) | Анҷом |
| Issues | 9 | Project → Issues ё Board. Дар Workspace бахши My issues ҳам ҳаст | [Issues](./my-app/src/features/issues/components/ProjectIssues.tsx), [My issues](./my-app/src/features/issues/components/WorkspaceIssues.tsx), [Board](./my-app/src/features/issues/components/ProjectBoard.tsx), [Sub-issues](./my-app/src/features/issues/components/IssueSubIssues.tsx), [API](./my-app/src/features/issues/api/issue.api.ts) | Пайваст, [камбудиҳо](#issues) |
| Comments | 4 | Project → Issues → як issue → Comments | [UI](./my-app/src/features/comments/components/IssueComments.tsx), [API](./my-app/src/features/comments/api/comment.api.ts) | Пайваст, [камбудиҳо](#comments) |
| Cycles | 7 | Project → Cycles | [UI](./my-app/src/features/projects/cycles/components/ProjectCycles.tsx), [API](./my-app/src/features/projects/cycles/api/cycle.api.ts) | Анҷом |
| Modules | 7 | Project → Modules | [UI](./my-app/src/features/projects/modules/components/ProjectModules.tsx), [API](./my-app/src/features/projects/modules/api/module.api.ts) | Анҷом |
| Relations | 3 | Project → Issues → як issue → Relations | [UI](./my-app/src/features/relations/components/IssueRelations.tsx), [API](./my-app/src/features/relations/api/relation.api.ts) | Анҷом |
| Activity | 1 | Project → Issues → як issue → Activity | [UI](./my-app/src/features/activity/components/IssueActivity.tsx), [API](./my-app/src/features/activity/api/activity.api.ts) | Анҷом |
| Attachments | 3 | Project → Issues → як issue → Attachments | [UI](./my-app/src/features/attachments/components/IssueAttachments.tsx), [API](./my-app/src/features/attachments/api/attachment.api.ts) | Пайваст, [маҳдудияти андоза](#attachments) |
| Notifications | 3 | Workspace → Notifications ё зангӯлаи боло | [Саҳифа](./my-app/src/features/notifications/components/WorkspaceNotifications.tsx), [Менюи боло](./my-app/src/features/notifications/components/RecentNotifications.tsx), [API](./my-app/src/features/notifications/api/notification.api.ts) | Анҷом |
| Invites | 2 | Workspace → Members → Invite. Қабул аз роҳи `/invites/<token>` | [Сохтани даъват](./my-app/src/features/workspaces/components/WorkspaceMembers.tsx), [Қабули даъват](./my-app/src/features/invites/components/InviteScreen.tsx), [API](./my-app/src/features/invites/api/invite.api.ts) | Пайваст, [маҳдудияти email](#invites) |

## Корҳои боқимонда

### Auth

Сабтином, воридшавӣ, баромадан, нав кардани токен ва тағйири профил пайвастанд. **Remember me** ва бозгашт ба саҳифаи дархостшуда пас аз ворид шудан ҳанӯз сохта нашудаанд.

### Issues

Сохтан, таҳрир, нест кардан, таъини иҷрокунанда ва тамға, филтрҳо, Board ва Sub-issues пайвастанд. Тавсифи issue ҳоло ҳамчун матни оддӣ нишон дода мешавад. Дар рӯйхати умумӣ номи баъзе иҷрокунандаҳо дастнорас аст, вақте ки backend маълумоти онҳоро холӣ мефиристад.

Дар **Board** кортро аз нишонаи шашнуқта кашед. Ҷойи корт дар дохили сутун ва байни сутунҳо фавран дар экран иваз мешавад. Фронтенд ҷойро бо `sort_order` ва ҳолатро бо `state_id` сабт мекунад. Агар API тағйирро рад кунад, Board тартиби пешинаро барқарор карда, хатогиро нишон медиҳад. [Компоненти Board](./my-app/src/features/issues/components/ProjectBoard.tsx) · [Сабти ҷой ва ҳолат](./my-app/src/features/issues/hooks/useMoveBoardIssue.ts)

### Comments

Шарҳҳоро дидан, илова кардан, таҳрир кардан ва нест кардан мумкин аст. Markdown ва нишон додани шарҳ пеш аз тасдиқи сервер ҳанӯз сохта нашудаанд.

### Attachments

Илова, зеркашӣ ва нест кардани файл пайвастанд. Backend-и маҳаллӣ ҳоло файлҳои аз **1 MiB** калонро рад мекунад.

### Invites

Сохтан, нусха гирифтани линки даъват ва қабул пайвастанд. Фиристодани email-и воқеӣ дар backend ҳанӯз амалӣ нашудааст.

## Сохтори код ва санҷиш

- `src/app/` саҳифаҳо ва route-ҳои Next.js-ро дар бар мегирад. Саҳифаи [Workspaces](./my-app/src/app/%28dashboard%29/workspaces/page.tsx) ва саҳифаи [дохили issue](./my-app/src/app/%28dashboard%29/workspaces/%5BworkspaceSlug%5D/projects/%5BprojectId%5D/issues/%5BissueId%5D/page.tsx) аз ҳамин ҷо оғоз мешаванд.
- `src/features/` барои ҳар бахш компонентҳои UI, дархостҳои API ва hooks-и React Query дорад. Масалан, рӯйхати Issues аз [саҳифаи project](./my-app/src/app/%28dashboard%29/workspaces/%5BworkspaceSlug%5D/projects/%5BprojectId%5D/issues/page.tsx) ба [компоненти Issues](./my-app/src/features/issues/components/ProjectIssues.tsx), [useIssues](./my-app/src/features/issues/hooks/useIssues.ts) ва [Issue API](./my-app/src/features/issues/api/issue.api.ts) меравад.
- Аз ҷузвдони `my-app/` фармони `npm run lint` кодро месанҷад ва `npm run build` барномаро барои нашр месозад.

Build ва lint гузаштаанд. Ҷараёнҳои интихобшуда дар браузер бо API-и намунавӣ санҷида шудаанд. Санҷиши пурраи ҳамаи 74 амалиёт бо backend ва базаи воқеӣ ҳанӯз гузаронида нашудааст.
