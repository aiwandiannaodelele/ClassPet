"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function UserAgreementSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>用户协议</CardTitle>
          <CardDescription>使用本软件前，请仔细阅读以下协议</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <h3 className="font-bold text-base text-slate-800">一、总则</h3>
              <p>1.1 欢迎使用萌宠班级屋（以下简称"本软件"）。在使用本软件前，请您仔细阅读本协议的全部内容。</p>
              <p>1.2 您使用本软件即视为您已阅读并同意遵守本协议的所有条款。如果您不同意本协议的任何内容，请立即停止使用本软件。</p>
              <p>1.3 本软件的开发者保留随时修改本协议的权利，修改后的协议将在软件内公布。继续使用本软件即视为您已接受修改后的协议。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">二、服务内容</h3>
              <p>2.1 本软件是一款面向教育场景的班级管理辅助工具，主要功能包括宠物养成、积分评价、数据记录等。</p>
              <p>2.2 本软件由开发者独立开发和维护，开发者有权根据实际情况调整、暂停或终止部分或全部服务。</p>
              <p>2.3 本软件的服务内容可能会根据版本更新而发生变化，具体以软件实际提供的功能为准。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">三、用户注册与使用</h3>
              <p>3.1 使用本软件需要注册账号。用户应按照注册页面提示填写真实、准确的信息，并对所提供的信息负责。</p>
              <p>3.2 用户应妥善保管账号和密码，因账号和密码泄露或被他人盗用造成的损失，由用户自行承担。</p>
              <p>3.3 用户不得将账号转让、出借给他人使用。如发现账号被盗用，应立即通知开发者。</p>
              <p>3.4 使用本软件时，用户应遵守中华人民共和国相关法律法规，不得从事违法违规活动。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">四、用户行为规范</h3>
              <p>4.1 用户在使用本软件过程中，不得从事以下行为：</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>发布、传播违法违规信息；</li>
                <li>侵犯他人知识产权或其他合法权益；</li>
                <li>恶意攻击、破坏本软件的正常运行；</li>
                <li>利用本软件进行商业诈骗或其他违法犯罪活动；</li>
                <li>其他损害开发者或第三方合法权益的行为。</li>
              </ul>

              <h3 className="font-bold text-base text-slate-800 mt-6">五、知识产权</h3>
              <p>5.1 本软件的所有知识产权（包括但不限于著作权、商标权、专利权等）均归开发者所有。</p>
              <p>5.2 本软件基于 GNU Affero General Public License v3.0 (AGPL-3.0) 开源协议发布。您可以在遵守该协议的前提下自由使用、修改和分发本软件。</p>
              <p>5.3 用户在本软件中创建的数据（如班级信息、学生信息、评价记录等）的知识产权归用户所有。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">六、隐私保护</h3>
              <p>6.1 开发者重视用户隐私保护，具体请参阅《隐私政策》。</p>
              <p>6.2 开发者会采取合理的技术和管理措施保护用户的个人信息安全。</p>
              <p>6.3 用户可在软件内自行管理自己的数据，包括查看、修改、删除等操作。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">七、免责声明</h3>
              <p>7.1 本软件按"现状"和"可用"状态提供服务，开发者不对其适用性、准确性、完整性做任何明示或暗示的保证。</p>
              <p>7.2 因网络状况、硬件故障、软件缺陷等不可预见因素导致的服务中断或数据丢失，开发者不承担责任。</p>
              <p>7.3 用户因使用本软件而产生的任何损失或损害，开发者不承担责任，除非该损失或损害是由于开发者的故意或重大过失造成的。</p>
              <p>7.4 用户因违反本协议或相关法律法规而造成的任何后果，由用户自行承担。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">八、协议的变更</h3>
              <p>8.1 开发者有权根据需要修改本协议，修改后的协议将在软件内公布。</p>
              <p>8.2 您继续使用本软件即表示您已接受修改后的协议。如果您不同意修改后的协议，请停止使用本软件。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">九、争议解决</h3>
              <p>9.1 本协议的签订、履行、解释及争议解决均适用中华人民共和国法律（不含冲突法规则）。</p>
              <p>9.2 因本协议或使用本软件所发生的争议，双方应首先通过友好协商解决。协商不成的，任何一方均可向人民法院提起诉讼。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">十、联系方式</h3>
              <p style={{ wordBreak: 'break-word' }}>10.1 如有任何问题或建议，请发送邮件至：aiwandiannaodelele@outlook.com。</p>
              <p>10.2 开发者将在收到邮件后尽快回复。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">十一、其他条款</h3>
              <p>11.1 本协议自用户同意并开始使用本软件之日起生效。</p>
              <p>11.2 本协议中的任何条款如被认定为无效或不可执行，不影响其他条款的效力和执行。</p>
              <p>11.3 本协议为开发者与用户之间关于使用本软件的完整协议，取代双方之前就相关事项达成的任何口头或书面协议。</p>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>隐私政策</CardTitle>
          <CardDescription>保护您的个人信息安全是我们的重要责任</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <h3 className="font-bold text-base text-slate-800">一、引言</h3>
              <p>欢迎使用萌宠班级屋（以下简称"本软件"）。我们深知个人信息对您的重要性，您的隐私对我们的意义重大。我们将按照本隐私政策收集、使用、储存和分享您的个人信息，尽力保护您的个人信息安全可控。</p>
              
              <h3 className="font-bold text-base text-slate-800 mt-6">二、我们收集的信息</h3>
              <p>我们收集的信息包括：</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>账号信息：</strong>您注册时提供的用户名、密码、邮箱等信息；</li>
                <li><strong>使用数据：</strong>您在使用本软件时创建的班级信息、学生信息、评价记录等；</li>
                <li><strong>设备信息：</strong>您的设备型号、操作系统版本、浏览器类型、网络状态等信息；</li>
                <li><strong>日志信息：</strong>您使用本软件时产生的操作日志、IP地址、访问时间等信息。</li>
              </ul>

              <h3 className="font-bold text-base text-slate-800 mt-6">三、我们如何使用收集的信息</h3>
              <p style={{ wordBreak: 'break-word' }}>我们使用收集的信息用于以下目的：</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>提供、维护、改进我们的服务；</li>
                <li>响应您的请求、评论和问题；</li>
                <li>向您发送服务通知和技术支持信息；</li>
                <li style={{ wordBreak: 'break-word' }}>进行分析，了解用户如何使用我们的服务，以便优化产品质量；</li>
                <li>保护本软件及其他用户的安全；</li>
                <li>遵守法律法规规定的义务。</li>
              </ul>

              <h3 className="font-bold text-base text-slate-800 mt-6">四、信息的存储</h3>
              <p>4.1 您的个人信息将存储在中华人民共和国境内的服务器上。</p>
              <p>4.2 我们会采取合理的技术和管理措施，保护您的个人信息不被未经授权的访问、使用或泄露。</p>
              <p>4.3 我们会在法律规定的期限内保存您的个人信息。超过期限后，我们会删除或匿名化处理您的个人信息。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">五、信息的共享、转让、公开披露</h3>
              <p>5.1 我们不会与第三方分享您的个人信息，除非：</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>获得您的明确同意；</li>
                <li>根据法律法规的规定；</li>
                <li>根据政府主管部门的要求；</li>
                <li>为保护我们、用户或公众的权益、财产或安全所必需。</li>
              </ul>
              <p style={{ wordBreak: 'break-word' }}>5.2 我们不会将您的个人信息转让给第三方，除非获得您的明确同意。</p>
              <p>5.3 我们不会公开披露您的个人信息，除非获得您的明确同意或法律法规另有规定。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">六、您的权利</h3>
              <p>您对自己的个人信息享有以下权利：</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>访问权：</strong>您有权访问您的个人信息；</li>
                <li><strong>更正权：</strong>您有权更正不准确的个人信息；</li>
                <li><strong>删除权：</strong>您有权要求删除您的个人信息；</li>
                <li style={{ wordBreak: 'break-word' }}><strong>撤回同意权：</strong>您有权撤回对个人信息处理的同意；</li>
                <li style={{ wordBreak: 'break-word' }}><strong>注销账号权：</strong>您有权注销您的账号。</li>
              </ul>

              <h3 className="font-bold text-base text-slate-800 mt-6">七、未成年人保护</h3>
              <p>7.1 本软件主要面向学校教师和学生使用。如果您是未成年人，请在监护人的陪同下阅读本隐私政策。</p>
              <p>7.2 我们不会主动向未满十四周岁的未成年人收集个人信息。如果您是未满十四周岁的未成年人，请在监护人的指导下使用本软件。</p>
              <p style={{ wordBreak: 'break-word' }}>7.3 监护人有权代未成年人查阅、复制、更正、删除其个人信息。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">八、隐私政策的变更</h3>
              <p>8.1 我们可能会适时修订本隐私政策。</p>
              <p>8.2 当隐私政策发生变更时，我们会在软件内以弹窗、公告等形式向您展示变更后的隐私政策。</p>
              <p>8.3 对于重大变更，我们还会提供更为显著的通知（包括我们会通过公示的方式进行意见征集）。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">九、联系我们</h3>
              <p>如果您对本隐私政策有任何问题、意见或建议，可通过以下方式与我们联系：</p>
              <p style={{ wordBreak: 'break-word' }}>电子邮箱：aiwandiannaodelele@outlook.com</p>
              <p>我们将在收到您的请求后尽快回复。</p>

              <h3 className="font-bold text-base text-slate-800 mt-6">十、生效时间</h3>
              <p>本隐私政策自发布之日起生效。</p>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-slate-400 mt-4">
        最后更新：{new Date().toLocaleDateString('zh-CN')}
      </div>
    </div>
  );
}