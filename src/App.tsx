import {
  AppShell,
  Box,
  Card,
  Center,
  Container,
  Group,
  Header,
  Image,
  LoadingOverlay,
  NumberInput,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  ThemeIcon
} from "@mantine/core";
import {IconBrush} from "@tabler/icons";
import FilePicker from "./components/FilePicker";
// @ts-ignore
import style_img from "./styles.jpg"
import {useState} from "react";

// Check if production
const isProd = process.env.NODE_ENV === "production";
const API_URL = isProd?"":"http://localhost:8000/"

const EV_STEP_MAP = [
  {
    "event": "original",
    "name": "输入",
    "description": "原始图片"
  },
  {
    "event": "align",
    "name": "对齐",
    "description": "截取头像"
  },
  {
    "event": "segment",
    "name": "分割",
    "description": "擦除背景"
  },
  {
    "event": "reconstruction",
    "name": "重建",
    "description": "重建特征"
  },
  {
    "event": "style_transfer",
    "name": "生成",
    "description": "风格迁移"
  },
  {
    "event": "inpainted",
    "name": "修复",
    "description": "移除人像"
  },
  {
    "event": "composed",
    "name": "合成",
    "description": "合成图片"
  }
]

type ImgEvent = {
  event: string,
  url: string
}

export const App = () => {
  const [styleId, setStyleId] = useState(26);
  const [segment, setSegment] = useState(true);
  const [structureOnly, setStructureOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgs, setImgs] = useState<Array<ImgEvent>>([]);

  const start = async (file: Blob) => {
    setImgs([]);
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_URL}api/upload`, {
      method: "POST",
      body: formData
    });
    const data = await response.json();

    const file_id = data.id;
    const sseSource = new EventSource(
      `${API_URL}api/transfer?style_id=${styleId}&segment=${segment}&file_id=${file_id}&structure_only=${structureOnly}`);
    const handler = (ev: MessageEvent) => {
      console.log(ev);
      if ((segment && ev.type == "composed") || (!segment && ev.type == "style_transfer")) {
        setLoading(false);
        sseSource.close()
      }
      setImgs((imgs) => [...imgs, {event: ev.type, url: ev.data}]);
    }
    for (const ev of EV_STEP_MAP) {
      sseSource.addEventListener(ev.event, handler);
    }
  }

  return (
    <AppShell
      padding="md"
      header={<Header height={60} p={"xs"}>
        <Header height={60} p={"md"}>
          <Group sx={{height: "100%"}}>
            <ThemeIcon><IconBrush strokeWidth={2} size={20}/></ThemeIcon>
            <Text size={"lg"}>人像卡通化</Text>
          </Group>
        </Header>
      </Header>}
      styles={(theme) => ({
        main: {backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]},
      })}
    >
      <Container mt={"xl"} mx={"auto"} sx={{maxWidth: "800px"}}>
        <main>
          <Stack>
            <Center>
              <Image maw={"600px"} src={style_img}/>
            </Center>
            <NumberInput value={styleId} label={"风格选择"} disabled={loading} withAsterisk
                         onChange={(id) => {
                           if (id) {
                             setStyleId(id);
                           }
                         }}/>
            <Switch checked={segment} label={"启用语义分割处理"} disabled={loading}
                    onChange={(ev) => setSegment(ev.currentTarget.checked)}/>
            <Switch checked={structureOnly} label={"仅保留结构信息"} disabled={loading}
                    onChange={(ev) => setStructureOnly(ev.currentTarget.checked)}/>
            <FilePicker disabled={loading} title={"拖放图片到此或点击上传"} subtitle={"仅可上传一个文件"}
                        onFileChange={(file) => {
                          if (file !== null) {
                            start(file)
                          }
                        }}/>
            <Box pos={"relative"}>
              <LoadingOverlay visible={loading}/>
              <SimpleGrid cols={3} spacing={"lg"} breakpoints={[
                {maxWidth: "md", cols: 2, spacing: "md"},
                {maxWidth: "sm", cols: 1, spacing: "sm"}
              ]}>
                {imgs.map((ev) => {
                  const step = EV_STEP_MAP.find((step) => step.event === ev.event)!;
                  return (<Card p={"lg"} radius="md" withBorder>
                    <Text weight={500}>{step.name}</Text>
                    <Text size={"sm"} color={"dimmed"}>{step.description}</Text>
                    <Card.Section mt={"sm"}>
                      <Image src={`${API_URL}${ev.url}`} maw={"256px"}/>
                    </Card.Section>
                  </Card>)
                })}
              </SimpleGrid>
            </Box>
          </Stack>
        </main>
      </Container>
    </AppShell>
  )
}